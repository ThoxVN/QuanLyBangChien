const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public')); 

// Chuỗi kết nối MongoDB của bạn
const uri = 'mongodb+srv://admindb:admin123@cluster0.dcdmrga.mongodb.net/bachhonbang';

mongoose.connect(uri)
    .then(() => console.log("🎉 Đã kết nối MongoDB Atlas thành công!"))
    .catch(err => console.error("❌ Lỗi kết nối:", err));

// Schema: Mặc định teamId = 0 (Nghĩa là chưa vào nhóm nào)
const MemberSchema = new mongoose.Schema({
    name: String,
    job: String,
    teamId: { type: Number, default: 0 } 
});
const Member = mongoose.model('Member', MemberSchema);

// 1. API Lấy danh sách
app.get('/api/members', async (req, res) => {
    const members = await Member.find();
    res.json(members);
});

// 2. API Thêm thành viên mới (Vào danh sách chờ)
app.post('/api/members', async (req, res) => {
    const newMember = new Member({
        name: req.body.name,
        job: req.body.job,
        teamId: 0 // Ép định danh chưa có nhóm
    });
    await newMember.save();
    res.json({ message: "Thêm thành công!", member: newMember });
});

// 3. API CẬP NHẬT (MỚI) - Để chuyển thành viên vào nhóm
app.put('/api/members/:id', async (req, res) => {
    const { id } = req.params;
    const { teamId } = req.body;
    await Member.findByIdAndUpdate(id, { teamId: teamId });
    res.json({ success: true, message: "Đã chuyển nhóm!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy tại http://localhost:${PORT}`));