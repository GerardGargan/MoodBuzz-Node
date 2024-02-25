//used to protect routes and check user is logged in, redirects to login if not
exports.isAuth = (req, res, next) => {
    const { isLoggedIn } = req.session;

    if(!isLoggedIn) {
        //store the url the person was trying to access, we will redirect here if the login is successful
        req.session.route = req.originalUrl;
        //redirect to the login page
        return res.redirect('/login');
    }
    next();
}

//used to stop user from seeing pages such as login and register pages when they are already logged in
exports.isLoggedIn = (req, res, next) => {
    const { isLoggedIn }  = req.session;
    
    if(isLoggedIn) {
        res.redirect('/user/home');
    }
    next();

}