const supabase = require('../config/supabase');

const uploadImage = async (file) => {
    const ext = file.mimetype.split('/')[1];
    const fileName = `trips/${Date.now()}.${ext}`;

    console.log('uploadImage file:', {
        mimetype: file.mimetype,
        size: file.buffer?.length,
        fileName,
    });
    console.log('1. SUPABASE_BUCKET:', process.env.SUPABASE_BUCKET)

    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    console.log('2. available buckets:', buckets, bucketError);

    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    console.log('3. SUPABASE_URL:', process.env.SUPABASE_URL);

    console.log('4. supabase upload result:', { data, error });
    if (error) throw new Error(`5. Image upload failed: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(fileName);

    return publicUrl;
};

module.exports = uploadImage;