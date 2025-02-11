const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5000;
const app = express()


app.use(cors())
app.use(express.json())

const userName = process.env.DB_USER
const password = process.env.DB_PASS

// console.log(userName, password)
// console.log('hello')

const uri = `mongodb+srv://${userName}:${password}@cluster0.oi6ry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    
    const database = client.db("crowdFunding")
    const campaignCollection = database.collection("campaigns")
    const donationCollection = database.collection("donations")

    // ----------------------------------------------------------
    // ----------------------campaigns---------------------------

    // get all campaigns
    app.get('/campaigns', async(req, res) => {
        try{
            const campaigns = campaignCollection.find()
            const result = await campaigns.toArray()
            res.send(result)
            // console.log(campaigns)
        }
        catch{
            res.status(500).send({
                error: "fetch campaigns falied"
            })
        }
    })

    // get campaign by id
    app.get('/campaigns/:id', async(req, res)=> {
        const id = req.params.id;
        // console.log(id)
        const query = {_id : new ObjectId(id)}

        try{
            const result = await campaignCollection.findOne(query)
            res.send(result)
        }
        catch{
            res.status(500).send({
                error: "fetch campaigns falied"
            })

        }
    })

    // get campaign by EMAIL
    app.get('/myCampaigns', async(req, res)=> {
        const {email} = req.query;

        // json er user email er variable lage suppise userEmail
        const query = {userEmail : email}

        try{
            const campaigns = campaignCollection.find(query)
            const result = await campaigns.toArray()
            res.send(result)
        }
        catch{
            res.status(500).send({
                error: "fetch campaigns falied"
            })

        }
    })

    // INSERT A CAMPAIGN
    app.post("/campaigns", async(req, res)=> {
        const campaign = req.body
        // console.log("new campaign : ", campaign)

        try{
            const result = await campaignCollection.insertOne(campaign)
            res.send(result)
        }
        catch{
            res.status(500).send({
                error: "adding campaign falied"
            })
        }
    })


    // UPDATE A CAMPAIGN
    app.put("/campaigns/:id", async(req, res)=> {
        const id = req.params.id;
        const campaign = req.body
        

        const filter = {_id : new ObjectId(id)}
        const options = {upsert : true}
        const updatedCampaign = {
            $set: {
                 // component gula bosabo
                
                title: campaign.title,
                type: campaign.type,
                minAmount: campaign.minAmount,
                deadline: campaign.deadline,
                photo: campaign.photo,
                description: campaign.description,
               
            }
        }
        // console.log(id, updatedCampaign)

        try{
            const result = await campaignCollection.updateOne(filter, updatedCampaign, options)
            res.send(result)
        }
        catch{
            res.status(500).send({
                error: "update campaign falied"
            })
        }
    })

    // DELETE A CAMPAIGN
    app.delete('/deleteCampaigns/:id', async(req, res) => {
        const id = req.params.id;
        // console.log(id)

        const query = {_id : new ObjectId(id)}

        try{
            const result = await campaignCollection.deleteOne(query)
            res.send(result)
        }
        catch{
            res.status(500).send({
                error: "delete campaign falied"
            })
        }
    })



    // -----------------------------------------------------------------------------

    // ------------------------.............Donations.............................
    // INSERT A Donation
    app.post("/usersDonations", async(req, res)=> {
        const donation = req.body
        // console.log("new donation : ", donation)

        try{
            const result = await donationCollection.insertOne(donation)
            res.send(result)
        }
        catch{
            res.status(500).send({
                error: "adding donations falied"
            })
        }
    })

    // get Donation by EMAIL
    app.get('/myDonations', async(req, res)=> {
        const {email} = req.query;
        // console.log(email)
        // json er user email er variable lage suppise userEmail
        const query = {email : email}

        try{
            const donations = donationCollection.find(query)
            const result = await donations.toArray()
            res.send(result)
        }
        catch{
            res.status(500).send({
                error: "fetch donations falied"
            })

        }
    })

    // delete donation by id
    app.delete('/deleteDonation/:id', async(req, res) => {
        const id = req.params.id;
        // console.log(id)

        const query = {campaignId : id}

        try{
            const result = await donationCollection.deleteMany(query)
            res.send(result)
        }
        catch{
            res.status(500).send({
                error: "delete campaign falied"
            })
        }
    })

    app.put("/updateDonation/:id", async(req, res)=> {
        const id = req.params.id;
        const campaign = req.body
        

        const filter = {campaignId : id}
        const options = {upsert : true}
        const updatedCampaign = {
            $set: {
                 // component gula bosabo
                
                title: campaign.title,
                type: campaign.type,
                photo: campaign.photo,
                description: campaign.description,
               
            }
        }
        // console.log(id, updatedCampaign)

        try{
            const result = await donationCollection.updateOne(filter, updatedCampaign, options)
            res.send(result)
        }
        catch{
            res.status(500).send({
                error: "update campaign falied"
            })
        }
    })
    


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, ()=> {
    console.log(`server is running on port: ${port}`)
})
