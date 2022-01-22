const express = require('express');
const app = express()
const bodyParse = require('body-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken')


const JWTSecret = "kfhfhsbshgdbdhbhegbdhgfkjgnjngyr";

app.use(cors());

app.use(bodyParse.urlencoded({extended: false}))
app.use(bodyParse.json());

function auth(req, res, next) {
    const authToken = req.headers['authorization'];

    if(authToken != undefined) {

        const bearer = authToken.split(" ");
        var token = bearer[1]; 

        jwt.verify(token,JWTSecret,(err, data) => {
            if(err) {
                res.status(401)
                res.json({err: "token invalido"})
            } else {

                req.token = token;
                req.loggedUser = {id: data.id,email: data.email}
                req.empresa = "MW tecnologia";
                next()

            }
        })

    } else {
        res.status(401)
        res.json({err: "Token invalido"})
    }
    

}

var DB = {
    games: [
        {
            id: 1,
            nome: 'GTA 5',
            ano: 2021,
            preco: 600

        },
        {
            id: 2,
            nome: 'ddtank',
            ano: 2010,
            preco: 10

        },
        {
            id: 3,
            nome: 'Free Fire',
            ano: 2017,
            preco: 1000
        }
    ], 
    users: [
        {
            id: 1,
            nome: 'Levi Vanderley',
            email: "levi@gmail.com",
            password: 'queroverdescobrir'

        }, 
        {
            id: 2,
            nome: 'flavia natali',
            email: 'flavia@gmail.com',
            password: 'tente'
            
        }
    ]
}

app.get('/games',auth,(req, res) => {
     res.statusCode = 200;
     res.json(DB.games)
})

app.get('/games/:id', auth, (req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400)
    } else { 

        var id = parseInt(req.params.id)

        var game = DB.games.find( g => g.id == id)

        if(game != undefined) {
            res.statusCode = 200;
            res.json(game)
        } else {
            res.sendStatus(404)
        }
    }
})

app.post('/game',auth,(req,res) => {

    var {nome, ano, preco} = req.body;

    DB.games.push({
        id: 4,
        nome,
        ano,
        preco
    })

    res.sendStatus(200)

})

app.delete('/game/:id',auth, (req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    } else { 

        var id = parseInt(req.params.id)
        var index = DB.games.findIndex(g => g.id == id)

        if(index == -1) {
            res.statusCode(404)
        } else {
            DB.games.splice(index,1)
            res.sendStatus(200)

        }
    }
})

app.put('/game/:id',auth, (req, res) => {

    if(isNaN(req.params.id)){
        res.sendStatus(400)
    } else { 

        var id = parseInt(req.params.id)

        var game = DB.games.find( g => g.id == id)

        if(game != undefined) {

            var {nome, ano, preco} = req.body;

            if(nome != undefined) {
                game.nome = nome;
            }

            if(ano != undefined) {
                game.ano = ano;
            }

            if(preco != undefined){
                game.preco = preco
            }

            res.sendStatus(200)
            
        } else {
            res.sendStatus(404)
        }
    }


})

app.post('/auth',auth, (req, res) => {

    var {email, password} = req.body;

    if(email != undefined) {
       var user =  DB.users.find( u => u.email == email)

       if(user != undefined){
           if(user.password == password) {

               jwt.sign({id: user.id, email: user.email},JWTSecret,{expiresIn: "48hrs"},(err, token) => {
                   if(err){
                       res.status(400)
                       res.json({err: "Falha Interna"})

                   } else {

                    res.status(200);
                    res.json({token: token})

                   }
               })

           } else {
               res.status(401);
               res.json({err: "credencias invalidas"})
           }

       } else {
           res.status(404);
           res.json({err: "O email enviado não existe na base de dados"})
       }

    } else{
        res.status(400);
        res.json({err: "E-mail invalido"})
    }
})

app.listen(5050,() => {
    console.log('Servidor rodando')
})