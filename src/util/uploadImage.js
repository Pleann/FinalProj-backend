const supabase = require('../config/supabase');

const uploadImage = async (file) => {
    const fileName = `trips/${Date.now()}-${file.originalname}`;

    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (error) throw new Error(`Image upload failed: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(fileName);

    return publicUrl;
};

module.exports = uploadImage;