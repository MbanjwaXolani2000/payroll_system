const express = require('express');
const router = express.Router();

// Route for serving the main page
router.get('/', (req, res) => {
  req.db.query('SELECT * FROM employees', (err, employeeResults) => {
    if (err) {
      console.error('Error querying employees:', err);
      res.send('Error querying employees');
      return;
    }

    req.db.query('SELECT * FROM sites', (err, siteResults) => {
      if (err) {
        console.error('Error querying sites:', err);
        res.send('Error querying sites');
        return;
      }

      // Fetch payroll data from the database
      req.db.query(`
        SELECT p.*, e.name AS employee_name, s.name AS site_name
        FROM payroll p
        JOIN employees e ON p.employee_id = e.id
        JOIN sites s ON p.site_id = s.id`, 
      (err, payrollResults) => {
        if (err) {
          console.error('Error querying payroll data:', err);
          res.send('Error querying payroll data');
          return;
        }
        // Render index.ejs and pass employees, sites, and payroll data to the view
        res.render('index', { employees: employeeResults, sites: siteResults, payrolls: payrollResults });
      });
    });
  });
});


// Route for handling attendance form submission
router.post('/attendance', (req, res) => {
  const { employee, site, date, normal_hours, holiday_hours, night_shift_hours } = req.body;
  // Insert data into database
  req.db.query('INSERT INTO attendance (employee_id, site_id, date, normal_hours, holiday_hours, night_shift_hours) VALUES (?, ?, ?, ?, ?, ?)',
    [employee, site, date, normal_hours, holiday_hours, night_shift_hours], (err) => {
    if (err) {
      console.error('Error inserting attendance:', err);
      res.send('Error inserting attendance');
      return;
    }
    res.redirect('/');
  });
});

module.exports = router;

