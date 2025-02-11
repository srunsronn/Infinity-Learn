const verifyRole = (...allowedRole) => {
    return (req, res, next) =>{
        const {role} = req.user;
        if(!allowedRole.includes(role)){
            return res.status(403).json({message: "Permission Denied!"})
        }
        next();
    };
};
export default verifyRole;