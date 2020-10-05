const express = require('express');
const app =express();
const port = 5000;
const {auth} =require('./middleware/auth');
const {User} = require('./models/user');
const bodyParser = require('body-parser');
const mongoose =require('mongoose');
const config =require('./config/key');
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());
app.use(cookieParser());
mongoose.connect(config.mongoURI,{
    useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true,useFindAndModify:false
}).then(()=> console.log('mongodb connected..'))
.catch(function(err){
    console.log(err);
})

app.get('/', function(req,res){
    res.send('Hello World')
});

app.post('/api/users/register', function(req,res){
    // 회원 가입할때 필요한 정보들을 Client 에서 가져오면 그것들을 db에 넣어줌
    const user = new User(req.body)

    user.save(function(err,userInfo){
        if(err) return res.json({success:false,err})
        return res.status(200).json({success:true})
    })
})

app.post('/api/users/login', function(req,res){
    //요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({email: req.body.email}, function(err,user){
        if(!user){
            return res.json({
                loginSuccess:false,
                message:"제공된 이메일에 해당된 유저가 없습니다."
            })
        }
        //요청된 이메일이 db에 있다면 비밀번호가 맞는지 체크한다.

        user.비번체크(req.body.password, function(err,비번맞음){
            if(!비번맞음)
            return res.json({loginSuccess:false, message:"비밀번호가 틀렸습니다."})
        //비밀번호가 맞다면 토큰을 생성한다.
        user.generateToken(function(err,user){
            if(err) return res.status(400).send(err);

            // 토큰을 저장한다. 쿠키에 
                res.cookie("x_auth",user.token)
                .status(200)
                .json({loginSuccess:true,userId:user._id})
        })   
     })
    })
})

app.get('/api/users/auth',auth,function(req,res){
    // 여기까지 미들웨어를 통과해 왔다는 얘기는 authentication이 true 라는 말
    res.status(200).json({
        _id : req.user._id,
        isAdmin: req.user.role === 0 ? false: true,
        isAuth: true,
        email:req.user.email,
        name:req.user.name,
        lastname:req.user.lastname,
        role:req.user.role,
        image:req.user.image
    })
})


app.get('/api/users/logout', auth, function(req,res){
    User.findOneAndUpdate({_id:req.user._id},{
        token:""
    },function(err,user){
        if(err) return res.json({success:false,err});
        return res.status(200).send({
            success:true
        })
    })
})
app.listen(port, function(){
    console.log(`listening on port ${port}!`)
})

