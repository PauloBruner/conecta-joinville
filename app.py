from flask import Flask, render_template, request, redirect
import sqlite3
from flask import session

app = Flask(__name__)
app.secret_key = "chave_super_secreta_123"

# ---------------- CONEXÃO ----------------
def conectar():
    return sqlite3.connect("database.db")

# ---------------- CRIAR TABELAS ----------------
def criar_tabelas():
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT,
        senha TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS necessidades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        descricao TEXT,
        bairro TEXT
    )
    ''')
    
    cursor.execute("""
    SELECT necessidades.*, COUNT(ajudas.id) as total
    FROM necessidades
    LEFT JOIN ajudas ON necessidades.id = ajudas.necessidade_id
    GROUP BY necessidades.id
    """)
    necessidades = cursor.fetchall()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS ajudas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        necessidade_id INTEGER
    )
    ''')

    conn.commit()
    conn.close()

# ---------------- ROTAS ----------------

@app.route("/")
def index():
    return render_template("index.html")

# REGISTRO
@app.route("/register", methods=["GET","POST"])
def register():
    if request.method == "POST":
        nome = request.form["nome"]
        email = request.form["email"]
        senha = request.form["senha"]

        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO usuarios (nome,email,senha) VALUES (?,?,?)",
                       (nome,email,senha))
        conn.commit()
        conn.close()

        return redirect("/login")

    return render_template("register.html")

# LOGIN
@app.route("/login", methods=["GET","POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        senha = request.form["senha"]

        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM usuarios WHERE email=? AND senha=?",
                       (email,senha))
        user = cursor.fetchone()
        conn.close()

        if user:
            session["usuario"] = user[1]  # nome
            session["id"] = user[0]       # id
            return redirect("/dashboard")

    return render_template("login.html")

# DASHBOARD
@app.route("/dashboard")
def dashboard():
    conn = conectar()
    cursor = conn.cursor()

    tipo = request.args.get("tipo")

    if tipo == "ajudar":
        cursor.execute("""
        SELECT necessidades.*, COUNT(ajudas.id) as total
        FROM necessidades
        LEFT JOIN ajudas ON necessidades.id = ajudas.necessidade_id
        GROUP BY necessidades.id
        ORDER BY total ASC
        """)
    else:
        cursor.execute("""
        SELECT necessidades.*, COUNT(ajudas.id) as total
        FROM necessidades
        LEFT JOIN ajudas ON necessidades.id = ajudas.necessidade_id
        GROUP BY necessidades.id
        """)

    necessidades = cursor.fetchall()

    # métricas
    cursor.execute("SELECT COUNT(*) FROM ajudas")
    total_ajudas = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM necessidades")
    total_necessidades = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM usuarios")
    total_usuarios = cursor.fetchone()[0]

    conn.close()

    usuario = session.get("usuario", "Visitante")

    return render_template("dashboard.html",
        necessidades=necessidades,
        usuario=usuario,
        total_ajudas=total_ajudas,
        total_necessidades=total_necessidades,
        total_usuarios=total_usuarios
    )
    
# NOVA NECESSIDADE
@app.route("/nova", methods=["GET","POST"])
def nova():
    if request.method == "POST":
        titulo = request.form["titulo"]
        descricao = request.form["descricao"]
        bairro = request.form["bairro"]

        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO necessidades (titulo,descricao,bairro) VALUES (?,?,?)",
                       (titulo,descricao,bairro))
        conn.commit()
        conn.close()

        return redirect("/dashboard")

    return render_template("nova_necessidade.html")

# AJUDAR
@app.route("/ajudar/<int:id>", methods=["POST"])
def ajudar(id):
    usuario_id = session.get("id")

    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO ajudas (usuario_id, necessidade_id) VALUES (?,?)",
                   (usuario_id, id))
    conn.commit()
    conn.close()

    return redirect("/dashboard")

@app.route("/voluntario", methods=["GET","POST"])
def voluntario():
    if request.method == "POST":
        nome = request.form["nome"]
        habilidade = request.form["habilidade"]

        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO usuarios (nome,email,senha) VALUES (?,?,?)",
                       (nome, "voluntario@email.com", "123"))
        conn.commit()
        conn.close()

        return redirect("/dashboard")

    return render_template("voluntario.html")

@app.route("/ongs")
def ongs():
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM usuarios")
    usuarios = cursor.fetchall()

    conn.close()

    return render_template("ongs.html", usuarios=usuarios)

# ---------------- INICIAR ----------------
criar_tabelas()

if __name__ == "__main__":
    app.run(debug=True)
    
    
   # git add . 
   # git commit -m "atualização visual app" 
   # git push 