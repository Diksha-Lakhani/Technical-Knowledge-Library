from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional,List
import mysql.connector
from contextlib import asynccontextmanager 
import json
import uuid
import shutil
import os
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles

load_dotenv()

conn = None

@asynccontextmanager
async def lifespan(app:FastAPI):
    global db_pool

    # Initialize connection pool on startup
    db_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name="mypool",
        pool_size=5,
        pool_reset_session=True,
        host=os.getenv("HOST", "127.0.0.1"),
        user=os.getenv("USER"),
        password=os.getenv("PASSWORD"),
        database=os.getenv("DATABASE"),
        ssl_disabled=True  # Prevents SSL version negotiation errors on local dev
    )
    print("Database connected")

    yield       

    print("Database disconnected")

app = FastAPI(lifespan=lifespan)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:8080"],
#     allow_methods=["*"],
#     allow_headers=["*"] 
# )

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
upload_dir = os.path.abspath(os.path.join(BASE_DIR, "..", "attachments"))
os.makedirs(upload_dir, exist_ok=True)
app.mount("/attachments", StaticFiles(directory=upload_dir), name="attachments")

class LoginData(BaseModel):
    empid: str
    password: str

class SignInData(BaseModel):
    empid: str
    names: str
    password: str
    role: str
    loc: str

class RecentData(BaseModel):
    category: Optional[str] = None
    location: Optional[str] = None

class ProbReq(BaseModel):
    probId: str

class DeleteSoln(BaseModel):
    solnId: str
    empid: str
    probId: str

class Profile(BaseModel):
    empid: str

class Pass(BaseModel):
    empid: str
    password: str

class ReviewReq(BaseModel):
    reqId: str
    status: str
    remarks: Optional[str] = None
    empid: str

class Search(BaseModel):
    keyword: str

class Pending(BaseModel):
    empid: Optional[str] = None

@app.post("/login")
def login(data: LoginData):
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """SELECT u.role, l.name as location FROM user u 
        join location l on l.id = u.location_id 
        WHERE u.empid = %s AND u.password = %s""",
        (data.empid, data.password)
    )
    info = cursor.fetchone()
    cursor.close()
    conn.close()
    if info:
        return {"success": True, "info":info}
    else:
        return {"success": False}

@app.post("/signin")
def signin(data: SignInData):
    conn = db_pool.get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """insert into user values(%s,%s,%s,%s,
            (select id from location where name = %s))""",
            (data.empid, data.password, data.role, data.names, data.loc)
        )
        conn.commit()
        print(cursor.rowcount,"record inserted")
        return {'success':True, 'message':'User logged in successfully.'}
    
    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")

        if e.errno == 1062:
            return {
                "success": False, 
                "message": f"User with Employee ID '{data.empid}' already exists."
            }

        return {"success": False, "message": "A database error occurred."}

    except Exception as e:
        conn.rollback()
        print(f"Unexpected error: {e}")
        return {"success": False, "message": "An unexpected error occurred."}

    finally:
        cursor.close()
        conn.close()
        
@app.post("/recent")
def getProb(data: RecentData):
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    base_query = """
        SELECT 
            p.id,p.title, p.description, 
            c.name AS category, 
            l.name AS location, 
            COUNT(s.id) AS solution_count 
        FROM problem p 
        JOIN category c ON p.category_id = c.id 
        JOIN location l ON p.location_id = l.id 
        LEFT JOIN solution s ON p.id = s.problem_id 
    """

    where_clauses = []
    params = []

    if data.category:
        where_clauses.append("c.name = %s")
        params.append(data.category)

    if data.location:
        where_clauses.append("l.name = %s")
        params.append(data.location)

    if where_clauses:
        base_query += " WHERE " + " AND ".join(where_clauses)       # takes all elements in list and glue them together using <AND> in between the elements

    base_query += """
        GROUP BY p.id, p.title, p.description, c.name, l.name 
        ORDER BY p.id DESC 
        LIMIT 15;
    """

    cursor.execute(base_query, params)
    prob = cursor.fetchall()
    cursor.close()
    conn.close()
    return prob

@app.post("/createProbSolnReq")
async def addProbSolnReq(
    solnChange: str = Form(...),     #FormData converts everything to string. so the values would be something like '{title:'', descrip:'',....}'
    empid: str = Form(...),
    attachment: Optional[List[UploadFile]] = File(None)
    ):
    conn = db_pool.get_connection()
    cursor = conn.cursor()

    try:
        soln_changes = json.loads(solnChange)
        attachment_list = []

        if attachment:
            for file in attachment:
                unique_filename = f"{uuid.uuid4()}_{file.filename}"      #unique file anme given to every file coming from frontend
                file_path = os.path.join(upload_dir, unique_filename)               #take the whole file path

                with open(file_path, "wb") as buffer:           #writing file as binary so any type of file can be saved
                    shutil.copyfileobj(file.file,buffer)

                attachment_list.append({
                    "file_path": file_path,
                    "file_type": file.content_type,
                    "original_name":file.filename
                })

        soln_changes["attachment"] = attachment_list
        

        json_for_db = json.dumps(soln_changes)          #changing json back to string so it can be given to db. the db will take the strong, see that it is a valid json and store it as json

        cursor.execute(
            "insert into admin_req(request_type, payload, requested_by) values('create_prob_sol', %s, %s)",
            (json_for_db,empid)
        )
        conn.commit()
        print(cursor.rowcount,"record inserted")
        return {'success':True}
    
    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'success':False}

    finally:
        cursor.close()
        conn.close()

@app.post("/getProb")
def getProb(data: ProbReq):
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
            """
                select p.id, p.title, p.description, p.created_at,
                c.name as category, 
                l.name as location,
                count(s.id) as solution_count
                from problem p
                join category c on p.category_id = c.id
                join location l on p.location_id = l.id
                left join solution s on p.id = s.problem_id
                where p.id = %s
                group by p.id, p.title,p.description, p.created_at, c.name, l.name
                order by p.id desc 
            """, [data.probId]
        )
        problem_details = cursor.fetchone()

        cursor.execute(
            """
                select s.id, s.description, s.solved_by, s.solved_at, l.name as location, u.name,
                json_arrayagg( if(a.id is not null, 
                                    json_object('file_path', a.file_path, 'file_type', a.file_type, 'original_name', a.original_name),
                                    null)) as attachments
                from solution s
                left join attachment a on s.id = a.solution_id
                join location l on s.location_id = l.id
                join user u on u.empid = s.solved_by
                where s.problem_id = %s
                group by s.id, s.description, s.solved_by, s.solved_at, l.name
            """,[data.probId]
        )
        solution_details = cursor.fetchall()

        if problem_details.get("created_at"):
            problem_details["created_at"] = str(problem_details["created_at"])

        for sol in solution_details:
            if sol.get("solved_at"):
                sol["solved_at"] = str(sol["solved_at"])
            if isinstance(sol.get("attachments"),str):
                sol["attachments"] = json.loads(sol["attachments"])            
            if sol.get("attachments") and sol["attachments"] == [None]:
                    sol["attachments"] = []

        cursor.execute(
            """insert into trend(category_id, location_id, problem_id, problem_title) values(
                (select id from category where name = %s), (select id from location where name = %s), %s,%s
            )""",(problem_details["category"], problem_details["location"], data.probId, problem_details["title"])
        )
        conn.commit()
        print(cursor.rowcount,"record inserted in trends")

        return({'prob': problem_details, 'soln': solution_details})
    finally:
        cursor.close()
        conn.close()

@app.get("/viewTrends")
def viewTrends():
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
        """
            select c.name as category, count(*) as category_views from trend t
            join category c on t.category_id = c.id
            group by c.name
            order by category_views desc
        """)
        cat = cursor.fetchall()

        cursor.execute(
        """
            select l.name as location, count(*) as location_views from trend t
            join location l on t.location_id = l.id
            group by l.name
            order by location_views desc
        """
        )
        loc = cursor.fetchall()

        cursor.execute(
        """
            select problem_title as problem, count(*) as problem_views from trend
            group by problem_title
            order by problem_views desc
        """
        )
        problem = cursor.fetchall()

        cursor.execute(
            """select u.name, count(*) as solution_contri from history h
            join user u on u.empid = h.requested_by
            where status = 'approved'
            group by u.name
            order by solution_contri desc"""
        )
        users = cursor.fetchall()

        trends = {'cat':cat, 'loc': loc, 'prob': problem, 'users': users}
        return(trends)

    finally:
        cursor.close()
        conn.close()

@app.post("/deleteSolnReq")
def deleteSolnReq(data: DeleteSoln):
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """insert into admin_req(request_type,target_solution_id,requested_by, problem_id) values('delete_sol',%s,%s,%s)""", (data.solnId, data.empid, data.probId)
        )
        conn.commit()
        print(cursor.rowcount,"record inserted")
        return {'success': True}
    
    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'success':False}

    finally:
        cursor.close()
        conn.close()

@app.post("/updateSolnReq")
def updateSolnReq(
    solnChange: str = Form(...),
    empid: str = Form(...),
    attachment: Optional[List[UploadFile]] = File(None),
    solnId: str = Form(...),
    probId: str = Form(...)
):
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    soln_changes = json.loads(solnChange)
    attachment_list = []

    if attachment:
        for file in attachment:
            unique_filename = f"{uuid.uuid4()}_{file.filename}"      #unique file anme given to every file coming from frontend
            file_path = os.path.join(upload_dir, unique_filename)               #take the whole file path

            with open(file_path, "wb") as buffer:           #writing file as binary so any type of file can be saved
                shutil.copyfileobj(file.file,buffer)

            attachment_list.append({
                "file_path": file_path,
                "file_type": file.content_type,
                "original_name": file.filename
            })

    soln_changes["attachment"] = attachment_list
    
    json_for_db = json.dumps(soln_changes)

    try:
        cursor.execute(
            """
                insert into admin_req(request_type, target_solution_id, payload, requested_by,problem_id) values('update_sol',%s,%s,%s,%s)
            """, (solnId,json_for_db, empid, probId)
        )

        conn.commit()
        print(cursor.rowcount,"record inserted")
        return {'success': True}
    
    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'success':False}

    finally:
        cursor.close()
        conn.close()

@app.post("/addSolnReq")
def addSolnReq(
    solnChange: str = Form(...),
    empid: str = Form(...),
    attachment: Optional[List[UploadFile]] = File(None),
    probId: str = Form(...)
    ):
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    soln_changes = json.loads(solnChange)
    attachment_list = []

    if attachment:
        for file in attachment:
            unique_filename = f"{uuid.uuid4()}_{file.filename}"      #unique file anme given to every file coming from frontend
            file_path = os.path.join(upload_dir, unique_filename)               #take the whole file path

            with open(file_path, "wb") as buffer:           #writing file as binary so any type of file can be saved
                shutil.copyfileobj(file.file,buffer)

            attachment_list.append({
                "file_path": file_path,
                "file_type": file.content_type,
                "original_name": file.filename
            })

    soln_changes["attachment"] = attachment_list
    
    json_for_db = json.dumps(soln_changes)

    try:
        cursor.execute(
            """
                insert into admin_req(request_type, payload, requested_by,problem_id) values('create_sol',%s,%s,%s)
            """, (json_for_db, empid, probId)
        )

        conn.commit()
        print(cursor.rowcount,"record inserted")
        return {'success': True}
    
    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'success':False}

    finally:
        cursor.close()
        conn.close()

@app.post("/viewProfile")
def viewProfile(data:Profile):
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """select u.empid, u.password, u.role, u.name, l.name as location
            from user u
            left join location l on u.location_id = l.id
            where u.empid = %s
        """,[data.empid]
    )
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user

@app.post("/viewContri")
def viewContri(data:Profile):
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    try:

        cursor.execute(
            """select h.id, h.request_type, h.prob_title, h.prob_descrip, c.name as category, l.name as location, h.solution, h.requested_by, ureq.name as requestedBy, h.requested_at, h.status, h.remarks, h.reviewed_by, urev.name as reviewedBy, h.reviewed_at, h.attachment from history h
            join category c on c.id = h.category_id
            join location l on l.id = h.location_id
            join user ureq on ureq.empid = h.requested_by
            join user urev on urev.empid = h.reviewed_by
            where requested_by = %s""",[data.empid]
        )
        hist = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
    
    for row in hist:
        if isinstance(row.get("attachment"),str):
            try:
                row["attachment"] = json.loads(row["attachment"])
            except(json.JSONDecodeError, TypeError):
                row["attachment"] = []
    return hist
    
@app.post("/changePass")
def changePass(data: Pass):
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "update user set password = %s where empid = %s", (data.password, data.empid)
        )
        conn.commit()
        print(cursor.rowcount,"record inserted")
        return {'success': True}
    
    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'success':False}

    finally:
        cursor.close()
        conn.close()

@app.post("/getReq")
def getReq(data:Pending):
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    contri = []

    base_query_probSol = """
        select a.id, a.payload, a.requested_at, a.requested_by, a.status, u.name
        from admin_req a
        left join user u on a.requested_by = u.empid
        where request_type = 'create_prob_sol' and status = 'pending'
    """

    base_query_createSol = """
        select a.id, a.payload, a.requested_at, a.requested_by, a.status, a.remarks, p.title, p.description, c.name as category, u.name
        from admin_req a
        left join problem p on a.problem_id = p.id
        left join category c on p.category_id = c.id
        left join user u on a.requested_by = u.empid               
        where request_type = 'create_sol' and status='pending'
    """

    base_query_updateSol =  """
        select a.id, a.payload, a.requested_at, a.requested_by, a.status, a.remarks, p.title, p.description, c.name as category, u.name
        from admin_req a
        left join problem p on a.problem_id = p.id
        left join category c on p.category_id = c.id
        left join user u on a.requested_by = u.empid
        where request_type = 'update_sol' and status = 'pending'
    """

    base_query_deleteSol = """
        SELECT a.id, a.requested_at, a.requested_by, a.status, a.remarks,
        p.title, p.description,
        c.name AS category,
        l.name AS location,
        u.name,
        s.description AS solution,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('original_name', att.original_name, 'file_path', att.file_path))        FROM attachment att
        WHERE att.solution_id = a.target_solution_id) AS attachment
        FROM admin_req a
        LEFT JOIN problem  p ON p.id = a.problem_id
        LEFT JOIN solution s ON s.id = a.target_solution_id
        LEFT JOIN category c ON c.id = p.category_id
        LEFT JOIN location l ON l.id = p.location_id
        left join user u on a.requested_by = u.empid
        WHERE a.request_type = 'delete_sol' and status = 'pending'        
    """
    
    where_clause = []
    params = []

    if(data.empid):
        where_clause = "and a.requested_by = %s"
        params = [data.empid]

    if where_clause:
        base_query_probSol += where_clause
        base_query_createSol += where_clause
        base_query_updateSol += where_clause
        base_query_deleteSol += where_clause

    try:
        cursor.execute(base_query_probSol, params)
        probSol = cursor.fetchall()

        cursor.execute(base_query_createSol,params)
        createSol = cursor.fetchall()

        cursor.execute(base_query_updateSol, params)
        updateSol = cursor.fetchall()

        cursor.execute(base_query_deleteSol,params)
        deleteSol = cursor.fetchall()

    finally:
        cursor.close()
        conn.close()

    contri = {
        "create_prob_sol": probSol,
        "create_sol": createSol,
        "update_sol": updateSol,
        "delete_sol": deleteSol,
    }
    for sol in contri.values():    
        for row in sol:
            if isinstance(row.get("payload"),str):
                try:
                    row["payload"] = json.loads(row["payload"])
                except(json.JSONDecodeError, TypeError):
                    row["payload"] = {}
            if isinstance(row.get("attachment"), str):
                try:
                    row["attachment"] = json.loads(row["attachment"])
                except (json.JSONDecodeError, TypeError):
                    row["attachment"] = []

    return contri



def hist_create_prob_sol(cursor, payload, req, remarks, status, empid):
    cursor.execute(
        """
        insert into history(request_type, prob_title, prob_descrip, category_id, location_id, solution, 
        requested_by, requested_at, status, 
        remarks, reviewed_by, reviewed_at, attachment)
        values('create_prob_sol', %s, %s,
        (select id from category where name = %s),
        (select id from location where name = %s),
        %s, %s,%s,%s,%s,%s,now(),%s)
        """,(payload["title"], payload["descrip"],payload["cat"], payload["loc"],payload["soln"], req['requested_by'],req['requested_at'],status,remarks,empid,json.dumps(payload.get("attachment", [])))
    )

def hist_create_sol(cursor, payload, req, remarks, status, empid):
    cursor.execute(
        """
        insert into history(request_type, prob_title, prob_descrip, category_id, location_id, solution, 
        requested_by, requested_at, status, 
        remarks, reviewed_by, reviewed_at, attachment)
        values('create_sol', 
        (select title from problem where id = %s),
        (select description from problem where id = %s),
        (select category_id from problem where id = %s),
        (select id from location where name = %s),
        %s,%s,%s,%s,%s,%s,now(),%s)
        """,(req['problem_id'],req['problem_id'],req['problem_id'],payload["loc"],payload["soln"], req['requested_by'],req['requested_at'],status,remarks,empid,json.dumps(payload.get("attachment", [])))
    )

def hist_update_sol(cursor, payload, req, remarks, status, empid):
    cursor.execute(
        """
        insert into history(request_type, prob_title, prob_descrip, category_id, location_id, solution, 
        requested_by, requested_at, status, 
        remarks, reviewed_by, reviewed_at, attachment)
        values('update_sol', 
        (select title from problem where id = %s),
        (select description from problem where id = %s),
        (select category_id from problem where id = %s),
        (select id from location where name = %s),
        %s,%s,%s,%s,%s,%s,now(),%s)
        """,(req['problem_id'],req['problem_id'],req['problem_id'],payload["loc"],payload["soln"], req['requested_by'],req['requested_at'],status,remarks,empid,json.dumps(payload.get("attachment", [])))
    )

def hist_delete_sol(cursor, payload, req, remarks, status, empid):
    cursor.execute(
        """
        insert into history(request_type, prob_title, prob_descrip, category_id, location_id, solution, 
        requested_by, requested_at, status, 
        remarks, reviewed_by, reviewed_at, attachment)
        values('delete_sol', 
        (select title from problem where id = %s),
        (select description from problem where id = %s),
        (select category_id from problem where id = %s),
        (select location_id from problem where id = %s),
        (select description from solution where id = %s),
        (select requested_by from admin_req where id = %s),
        (select requested_at from admin_req where id = %s),
        %s,%s,%s,now(),%s)
        """,(req['problem_id'],req['problem_id'],req['problem_id'],req['problem_id'],req['target_solution_id'], req['id'],req['id'],status,remarks,empid,json.dumps(payload.get("attachment", [])))
    )

def reject_del_req(cursor,target_solution_id, empid, exclude_id):
    cursor.execute(
        """select * from admin_req
            where target_solution_id = %s
            and status = 'pending'
            and id != %s
        """,(target_solution_id, exclude_id)
    )
    del_req = cursor.fetchall()

    auto_remark = "Auto-rejected: the solution/problem this request referred to was deleted."

    for row in del_req:
        payload= row["payload"]
        if isinstance(payload, str):
            payload = json.loads(payload) if payload else {}
        payload = payload or {}
        log_history[row["request_type"]](cursor,payload,row,auto_remark,"rejected",empid)

    if del_req:
        ids = [row["id"] for row in del_req]
        placeholder = ',' .join(["%s"] * len(ids))
        cursor.execute(f"delete from admin_req where id in ({placeholder})",ids)

log_history = {
    "create_prob_sol": hist_create_prob_sol,
    "create_sol": hist_create_sol,
    "update_sol": hist_update_sol,
    "delete_sol": hist_delete_sol,
}

def save_attachments(cursor, problem_id, solution_id, attachments):
    for att in attachments or []:
        cursor.execute(
            "insert into attachment(problem_id, solution_id, file_path, file_type, original_name) values(%s,%s,%s,%s,%s)",(problem_id, solution_id, att['file_path'],att['file_type'], att['original_name'])
        )

def create_prob_sol(cursor,req,payload, empid, remarks, status):
    if status == 'approved':
        cursor.execute(
            """insert into problem(title, description, category_id, location_id) 
            values(%s,%s,
            (select id from category where name = %s),
            (select id from location where name = %s))""", (payload["title"], payload["descrip"], payload["cat"], payload["loc"])
        )
        problem_id = cursor.lastrowid

        cursor.execute(
            """ insert into solution(problem_id, description, solved_by, location_id) 
            values(%s, %s, %s,
            (select id from location where name = %s))""",(problem_id, payload["soln"],req["requested_by"], payload["loc"])
        )
        solution_id = cursor.lastrowid

        save_attachments(cursor,problem_id, solution_id, payload.get("attachment"))

    log_history["create_prob_sol"](cursor, payload, req, remarks, status, empid)

def create_sol(cursor, req, payload, empid, remarks, status):
    if status == 'approved':
        cursor.execute(
            """insert into solution(problem_id, description, solved_by, location_id)
            values(%s,%s,%s,
            (select id from location where name = %s))""", (req["problem_id"], payload["soln"], req["requested_by"], payload["loc"])
        )
        solution_id = cursor.lastrowid
        save_attachments(cursor, req["problem_id"], solution_id, payload.get("attachment"))

    log_history["create_sol"](cursor, payload, req, remarks, status, empid)

def update_sol(cursor, req, payload, empid, remarks, status):
        if status == 'approved':
            cursor.execute("select id from solution where id = %s", (req["target_solution_id"],))

            if cursor.fetchone() is None:
                raise ValueError("This solution no longer exists.")

            cursor.execute(
                """update solution 
                set description = %s, solved_at = now(), location_id = (select id from location where name = %s) 
                where id = %s""",(payload["soln"],payload["loc"], req["target_solution_id"])
            )
            save_attachments(cursor, req["problem_id"], req["target_solution_id"], payload.get("attachment"))

        log_history["update_sol"](cursor, payload, req, remarks, status, empid)

def delete_sol(cursor, req, payload, empid, remarks, status):
    if status == 'approved':
        cursor.execute("select id from solution where id = %s", (req["target_solution_id"],))
        if cursor.fetchone() is None:
            raise ValueError("This solution no longer exists.")
    
    log_history["delete_sol"](cursor, payload, req, remarks, status, empid)

    file_paths = []
    if status == 'approved':
        cursor.execute("select file_path from attachment where solution_id = %s",[req["target_solution_id"]])
        file_paths = [row["file_path"] for row in cursor.fetchall()]

        reject_del_req(cursor, req["target_solution_id"], empid, req["id"])

        cursor.execute("delete from attachment where solution_id = %s", [req["target_solution_id"]])
        cursor.execute("delete from solution where id = %s", [req["target_solution_id"]])

    return file_paths
    
APPLY = {
    "create_prob_sol": create_prob_sol,
    "create_sol": create_sol,
    "update_sol": update_sol,
    "delete_sol": delete_sol,
    }

@app.post("/reviewReq")
def reviewReq(data: ReviewReq):
    if data.status not in ("approved", "rejected"):
        return{"success": False, "message":"Invalid status."}
    
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
            "select * from admin_req where id = %s and status = 'pending' for update",
            [data.reqId]
        )
        req = cursor.fetchone()

        if req is None:
            return{"success": False, "message":"Request not found or already reviewed."}

        payload = req["payload"]
        if isinstance(payload, str):
            payload = json.loads(payload)
        payload = payload or {}
        files_to_delete = APPLY[req["request_type"]](cursor,req,payload,data.empid,data.remarks,data.status) or []
            
        cursor.execute(
            "delete from admin_req where id = %s",[data.reqId]
        )
        conn.commit()

        for path in files_to_delete:
            try:
                os.remove(path)
            except OSError as e:
                print(f"Could not delete attachment file {path}:{e}")

        return {"success": True}

    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {"success": False, "message": "Could not save the decision. Nothing was changed."}

    finally:
        cursor.close()
        conn.close()    



@app.post("/search")
def search(data: Search):
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        keys = data.keyword.strip().split()
        if not keys:
            return[]
        
        where_clause = []
        params = []

        for key in keys:
            where_clause.append("(title like %s or description like %s)")
            like_word = f"%{key}%"
            params.extend([like_word, like_word])

        where_sql = " or ".join(where_clause)

        cursor.execute(
            f"""select id, title, description from problem 
            where {where_sql}""",params
        )
        search = cursor.fetchall()
        return(search)

    finally:
        cursor.close()
        conn.close()    

@app.post("/deleteProb")
def deleteProb(data:ProbReq):
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("select count(*) as count from solution where problem_id = %s",[data.probId])
        cnt = cursor.fetchone()
        if cnt["count"] > 0:
            return{'success': False, 'message': 'This problem still has solutions and thus can;t be deleted.'}

        cursor.execute(
            """
            delete from problem where id = %s
            """,[data.probId]
        )
        conn.commit()

        deleteCount = cursor.rowcount
        print(deleteCount," record deleted")
        return {'success': True}

    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'success':False, 'message':'Could not delete the problem. Please try again in some time.'}
        
    finally:
        cursor.close()
        conn.close()    
