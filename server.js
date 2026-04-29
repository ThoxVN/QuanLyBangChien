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

// ==========================================
// THÊM SCHEMA VÀ API LƯU TỌA ĐỘ BẢN ĐỒ TEAM
// ==========================================
const TeamSchema = new mongoose.Schema({
    teamId: Number,
    x: Number,
    y: Number,
    side: String,
    name: String,   // Thêm: Tên custom của team
    color: String   // Thêm: Màu hiển thị của team
});
const Team = mongoose.model('Team', TeamSchema);

app.get('/api/teams', async (req, res) => {
    let teams = await Team.find();
    if (teams.length === 0) {
        // Nếu DB trống, tạo sẵn 10 team kèm tên và màu mặc định
        const defaultTeams = [];
        for(let i=1; i<=10; i++) {
            defaultTeams.push({
                teamId: i, 
                x: i<=5 ? 25 : 75, 
                y: 50, 
                side: i<=5 ? 'red' : 'blue',
                name: `TEAM ${i}`,
                color: i<=5 ? '#ef4444' : '#3b82f6'
            });
        }
        await Team.insertMany(defaultTeams);
        teams = await Team.find();
    }
    res.json(teams);
});

// API Cập nhật (Tọa độ, Tên, Màu sắc)
app.put('/api/teams/:id', async (req, res) => {
    // Dùng $set để chỉ cập nhật những trường được gửi lên
    await Team.findOneAndUpdate({ teamId: req.params.id }, { $set: req.body });
    res.json({ success: true, message: "Đã cập nhật Team" });
});