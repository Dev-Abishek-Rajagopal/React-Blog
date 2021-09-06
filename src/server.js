import  express  from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";
import path from "path";

const app = express();

app.use(express.static(path.join(__dirname,"/build")))
app.use(bodyParser.json());


const DB = async (operations,res) => {

    try {
        
    const client = await MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true });
    const db = client.db("blista-blog");

    await operations(db);
    
    client.close();
    } catch (error) {
        res.status(200).json(error);
    }

}


app.get("/api/project/:name", async (req,res) => {

    DB( async (db) => {


        const projectName = req.params.name;


    const projectInfo = await db.collection("projects").findOne({name:projectName});

    res.status(200).json(projectInfo);

    },res );
        
   

})

// app.get("/hello", (req, res) => res.send("Hello") );

// app.post("/hello", (req, res) => res.send(`Hello ${req.body.name}`));

// app.get("/hello/:name", (req,res) => res.send(`Hello ${req.body.name}`) );

app.post("/api/project/:name/votes/", async (req,res) => {
    
    DB(async (db) => {

        const projectName = req.params.name;

    const projectInfo = await db.collection("projects").findOne({name:projectName});

    await db.collection("projects").updateOne({name:projectName},
        {
            '$set': {
                votes: projectInfo.votes + 1,
            },
        })

    const upprojectInfo = await db.collection("projects").findOne({name:projectName});

    res.status(200).json(upprojectInfo);

    },res);
    
    

    
    
});

app.post("/api/project/:name/addcomt/", (req, res) => {
    const { username, text } = req.body;
    const projectName = req.params.name;

    DB( async (db) => {
        const projectInfo = await db.collection("projects").findOne({name:projectName});
        await db.collection("projects").updateOne({name:projectName},
            {
                "$set": {
                    Comment: projectInfo.Comment.concat({username,text}),
                },
            });

            const upprojectInfo = await db.collection("projects").findOne({name:projectName});
            res.status(200).json(upprojectInfo);
    },res);

    
});

app.get("*", (req,res) => {
    res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.listen(8000, () => console.log("@8000"));