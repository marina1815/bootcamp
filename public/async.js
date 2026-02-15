function attendre(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log("hello workd");
    await attendre (2000);
    console.log("after 2s")



}


main();

const express = require("express");
const app = express();
const port = 3000;

let users = [
  { id: 1, name: "Hanaa" },
  { id: 2, name: "Amira" },
];

// Pour pouvoir lire le JSON envoyé par le client (req.body)
app.use(express.json());
app.get("/", (req , res) => {res.send("my api is ready")});

app.get("/users", (req,res)=> {res.json(users)});

// POST /users -> crée un user
app.post("/users", (req, res) => {
  const { name } = req.body;

  // Vérification de base
  if (!name) {
    return res.status(400).json({ error: "Le champ 'name' est requis" });
  }

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    name,
  };

  users.push(newUser);

  // 201 = Created
  res.status(201).json(newUser);
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`✅ API démarrée sur http://localhost:${port}`);
});