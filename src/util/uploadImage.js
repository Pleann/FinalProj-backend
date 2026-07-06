const supabase = require('../config/supabase');

const uploadImage = async (file, folder = 'trips') => {
    const ext = file.mimetype.split('/')[1];
    const fileName = `${folder}/${Date.now()}.${ext}`;

    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

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