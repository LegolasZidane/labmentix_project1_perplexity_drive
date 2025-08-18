// import { uploadFile } from '../../controllers/fileController.js';
// import { supabaseProxyAuth } from '../../middlewares/supabaseProxyAuth.js';
// import { upload } from '../../middlewares/upload.js';

// const runMiddleware = (req, res) => {

//     return new Promise((resolve, reject) => {

//         upload.single("file")(req, res, (err) => {

//             if( err ) {
//             return reject(err);
//             } else {
//                 return resolve(req.file);
//             }
//         });
//     });
// };

// export const config = {
//     api: {
//         bodyParser: false
//     }
// };

// export default async function handler(req, res){
    
//     try{
//         const authError = await supabaseProxyAuth(req, res);
//         if( authError ) return;
        
//         if( req.method === "POST" ){
            
            
//             await runMiddleware(req, res);
//             console.log(req.file);
//             return await uploadFile(req, res);
        
//         } else {
//             return res.status(405).json({ error: "Method not allowed" });
//         }
//     } catch(error){
//         return res.status(500).json({message: "In /api/files/upload", details: error});
//     }
// }