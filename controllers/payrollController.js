const mysql = require('mysql2');

// MySQL Connection Setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '090916@Nicky',
  database: 'payroll'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Submit attendance
exports.submitAttendance = (req, res) => {
  const { employee, site, date, normal_hours, holiday_hours, night_shift_hours } = req.body;

  const sql = 'INSERT INTO attendance (employee_id, site_id, date, normal_hours, holiday_hours, night_shift_hours) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [employee, site, date, normal_hours, holiday_hours, night_shift_hours], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
};

// Generate Payslip
exports.generatePayslip = (req, res) => {
  const attendanceId = req.params.id;

  const sql = `
    SELECT a.*, e.name as employee_name, s.name as site_name, s.rate_per_hour
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    JOIN sites s ON a.site_id = s.id
    WHERE a.id = ?
  `;
  
  db.query(sql, [attendanceId], (err, results) => {
    if (err) throw err;

    const record = results[0];
    const normalPay = record.normal_hours * record.rate_per_hour;
    const holidayPay = record.holiday_hours * record.rate_per_hour * 1.5;  // Higher pay for holidays
    const nightPay = record.night_shift_hours * record.rate_per_hour * 1.2; // Higher pay for night shifts
    const grossSalary = normalPay + holidayPay + nightPay;
    const deductions = grossSalary * 0.1; // Assuming 10% deduction
    const netSalary = grossSalary - deductions;

    res.render('payslip', {
      employee: record.employee_name,
      site: record.site_name,
      date: record.date,
      normal_hours: record.normal_hours,
      holiday_hours: record.holiday_hours,
      night_shift_hours: record.night_shift_hours,
      grossSalary,
      netSalary
    });
  });
};
