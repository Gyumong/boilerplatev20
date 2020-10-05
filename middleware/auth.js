const {User} = require('../models/user');

let auth =function(req,res,next){
    // 인증 처리를 하는곳

    // client 쿠키에서 토큰을 가져옴

    let token =req.cookies.x_auth;

    // 토큰을 복호화 한후 유저를 찾는다
    User.findByToken(token,function(err,user){
        if(err) throw err;
        if(!user) return res.json({isAuth:false, error:true})

        req.token = token;
        req.user = user;
        next();
    })

    // 유저가 있으면 인증 ㅇ

    // 유저가 없으면 인증 ㄴ

}

module.exports= {auth};