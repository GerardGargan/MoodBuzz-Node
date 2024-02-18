//used to protect routes and check user is logged in
exports.isAuth = (req, res, next) => {
    const { isLoggedIn } = req.session;

    if(!isLoggedIn) {
        return res.redirect('/login');
    }
    next();
}

//used to stop user from seeing pages such as login and register pages as they are already logged in
exports.isLoggedIn = (req, res, next) => {
    const { isLoggedIn }  = req.session;
    
    if(isLoggedIn) {
        res.redirect('/user/home');
    }
    next();

}