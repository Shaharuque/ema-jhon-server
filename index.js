const express=require('express')
const cors=require('cors')
const port=process.env.PORT||5000;
require('dotenv').config()
const app=express()
const { MongoClient, ServerApiVersion } = require('mongodb');

//middleware
app.use(cors());
//req ar moddhey jei body/json data ashbey sheita parse korey dewar jnno 
app.use(express.json())


//connect database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yz2oh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();
        const productCollection = client.db("emajhon").collection("products");
        console.log('DB connected')

        //all the product can be seen after hitting 'localhost:5000/product' url/api (aita amader created api jeita client thekey fetch korley data pabo )
        app.get('/product',async(req,res)=>{
            const query={}  //all the data will be gathered thats why query null rakha hoisey
            const cursor=productCollection.find(query)   //DB thekey particular collection ar sob product find korey niye asha hocchey and 'localhost:5000/product' api tey req korley res hisbaey products pathabey
            const products= await cursor.toArray() //cursor.limit(10).toArray()=> tahley UI tey 10ta product e show korbey
            res.send(products)
        })

        app.get('/productCount',async(req,res)=>{
            //jokhn sob data lagbey tokhn query null rakhbo
            const query={}
            const cursor=productCollection.find(query)
            const count=await cursor.count()
            res.send({count})  // res.json(count) ar res.send({count}) both are same 
            //now if i hit the api/url:http://localhost:5000/productCount we will get 76 as total products in the products collection
        })
    }
    finally{

    }
}
run().catch(console.dir);


//root url/api
app.get('/',(req,res)=>{
    res.send('ema-jhon server is running')
})



app.listen(port,()=>{
    console.log('jhon server is running on port',port)
})