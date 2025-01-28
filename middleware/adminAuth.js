import  jwt, { decode }  from "jsonwebtoken";

const adminAuth = async (req, res , next)=>{
    try {
        const {token} = req.headers
        if(!token){
            return res.json({success: false, message:"inavlid data, NOT AUTHORIZED TO LOGIN "})
        }
        const token_decode = jwt.verify(token,process.env.JWT_SECRET);
        if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
            return res.json({success: false, message:"inavlid data, NOT AUTHORIZED TO LOGIN "})
        }
        next()
    } catch (error) {
        console.log(error)
        return res.json({success: false, message:error.message})

    }
}

export default adminAuth