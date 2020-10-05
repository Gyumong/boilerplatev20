const express = require('express');
const app =express();
const port = 5000;
const {User} = require('./models/user');
const bodyParser = require('body-parser');
const mongoose =require('mongoose');
const config =require('./config/key');
app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());

mongoose.connect(config.mongoURI,{
    useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true,useFindAndModify:false
}).then(()=> console.log('mongodb connected..'))
.catch(function(err){
    console.log(err);
})

app.get('/', function(req,res){
    res.send('Hello World')
});

app.post('/register', function(req,res){
    // 회원 가입할때 필요한 정보들을 Client 에서 가져오면 그것들을 db에 넣어줌
    const user = new User(req.body)

    user.save(function(err,userInfo){
        if(err) return res.json({success:false,err})
        return res.status(200).json({success:true})
    })
})

app.listen(port, function(){
    console.log(`listening on port ${port}!`)
})

