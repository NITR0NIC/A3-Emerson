const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {

    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });


app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect("mongodb://localhost:27017/biblioteca", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

const livroSchema = new mongoose.Schema({
  titulo: String,
  autor: String,
  ano: Number,
  arquivoUrl: String, 
});

const Livro = mongoose.model("Livro", livroSchema);


app.get("/livros", async (req, res) => {
  const livros = await Livro.find();
  res.json(livros);
});


app.post("/livros", upload.single("arquivo"), async (req, res) => {
  const { titulo, autor, ano } = req.body;

  if (!titulo || !autor || !ano) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
  }

  
  let arquivoUrl = null;
  if (req.file) {
    arquivoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  }

  const livro = new Livro({ titulo, autor, ano, arquivoUrl });
  await livro.save();
  res.status(201).json(livro);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
