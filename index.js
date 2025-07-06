require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;


const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.1xr6tjf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

const verifytoken = (req, res, next) =>{
    next();
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const employeeCollection = client.db('employeeManagement').collection('employees');
    const userCollection = client.db('employeeManagement').collection('users');

    //verify token
    const verifyToken = (req, res, next) => {
        if(!req.headers.authorization){
            return res.status(401).send({message: 'unauthorized access'});
        }
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
            if(err){
                return res.status(403).send({message: 'Forbidden access'});
            }
            req.decoded = decoded;
            next();
        })
    }

    // get login employees data
    app.get('users',async(req,res)=>{
        const email=req.query.email;
        const query={email:email};
        const result= await userCollection.find(query).toArray();
        res.send(result);
    })
    
    // create token
    app.post('jwt',(req,res)=>{
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.send({token});
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Welcome to the Employee Management API!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});