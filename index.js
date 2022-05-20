const express=require('express')
const cors=require('cors')
const port=process.env.PORT||5000;
require('dotenv').config()
const app=express()
const { MongoClient, ServerApiVersion ,ObjectId } = require('mongodb');

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

            console.log('query',req.query) //req.query=>client side thekey req ar sathey jei query pathano hoisey seita pabo

            const page=parseInt(req.query.page)
            const size=parseInt(req.query.size)
            const query={}  //all the data will be gathered thats why query null rakha hoisey
            
            const cursor=productCollection.find(query)   //DB thekey particular collection ar sob product find korey niye asha hocchey and 'localhost:5000/product' api tey req korley res hisbaey products pathabey

            let products;
            if(page || size){
                //skip ar concept
                //page 0 --> skip: 0 get: 0-10(10): 
                //page 1 --> skip: 1*10 get: 11-20(10):
                //page 2 --> skip: 2*10 get: 21-30 (10):
                //page 3 --> skip: 3*10 get: 21-30 (10):
                products= await cursor.skip(page*size).limit(size).toArray()
            }
            else{
                //page or size ar information na thakley sob gula product DB thekey niye ashbey amn kicho
                products= await cursor.toArray() //cursor.limit(10).toArray()=> tahley UI tey 10ta product e show korbey 
            }
           
            res.send(products) //je ai api call korbey takey response hisabey products data dibey
        })

        app.get('/productCount',async(req,res)=>{
            //jokhn sob data lagbey tokhn query null rakhbo
            const query={}
            const cursor=productCollection.find(query)

            const count=await productCollection.estimatedDocumentCount()//now if i hit the api/url:http://localhost:5000/productCount we will get 76 as total products in the products collection
            res.send({count})  // res.json(count) ar res.send({count}) both are same 
            
        })

        //use post to get  products by ids(normal POST method ar thekey ekto alada)
        app.post('/productByKeys',async(req,res)=>{
            const keys = req.body;
            const ids = keys.map(id => ObjectId(id));
            const query = {_id: {$in: ids}}
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            console.log(keys);
            res.send(products);
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