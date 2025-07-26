// kpi_report_generator_controller.js - แก้ไขปัญหาการแสดงข้อมูล
document.addEventListener('DOMContentLoaded', () => {

    // --- ไม่มีการเปลี่ยนแปลงฟังก์ชันเหล่านี้ ---
    const exportImageButton = document.getElementById('exportImageButton');
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwWIcRczMCQGCIjoZZMXcg25AYGqozTi8tpJOIuadW5XwY8ou49G2302z9EnI593wk/exec';

    function renderSummaryCards(summary) {
        if (!summary) {
            console.error('Summary data is null or undefined');
            return;
        }
        console.log('Rendering summary cards:', summary);
        const summaryPri = document.getElementById('summary_pri');
        const summaryTt = document.getElementById('summary_tt');
        const summaryAll = document.getElementById('summary_all');
        const summaryProblem = document.getElementById('summary_problem');
        if (summaryPri && summary.PRI) {
            summaryPri.innerHTML = `<div class="card-main-value">${summary.PRI.avgRate.toFixed(1)}%</div><div class="card-sub-value">${summary.PRI.closed}/${summary.PRI.scanned}</div>`;
        }
        if (summaryTt && summary.TT) {
            summaryTt.innerHTML = `<div class="card-main-value">${summary.TT.avgRate.toFixed(1)}%</div><div class="card-sub-value">${summary.TT.closed}/${summary.TT.scanned}</div>`;
        }
        if (summaryAll && summary.ALL) {
            summaryAll.innerHTML = `<div class="card-main-value">${summary.ALL.avgRate.toFixed(1)}%</div><div class="card-sub-value">${summary.ALL.closed}/${summary.ALL.scanned}</div>`;
        }
        if (summaryProblem && summary.problem !== undefined) {
            summaryProblem.innerHTML = `<span class="problem-total">${summary.problem}</span>`;
        }
    }

    // js/kpi_report_generator_controller.js

function renderCards(data) {
    const kpiResultContainer = document.getElementById('kpiResultContainer');
    console.log('renderCards called with data:', data);
    if (!kpiResultContainer) {
        console.error('kpiResultContainer element not found');
        return;
    }
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('Data for cards is invalid or empty');
        kpiResultContainer.innerHTML = '<p style="text-align: center; color: #666;">ไม่พบข้อมูลสำหรับแสดงผล</p>';
        return;
    }

    console.log(`Rendering ${data.length} employee cards`);
    kpiResultContainer.innerHTML = '';

    data.forEach((emp, index) => {
        if (!emp || !emp.types || !Array.isArray(emp.types)) {
            console.error(`Invalid employee data at index ${index}:`, emp);
            return; // ข้ามข้อมูลที่ไม่ถูกต้อง
        }

        const gradeClass = getGradeColorClass(emp.grade);
        const gradeColor = getGradeColor(emp.grade);

        // --- [MODIFIED] ---
        // เพิ่ม gradeClass เข้าไปใน class ของ card โดยตรง
        const card = document.createElement('div');
        card.className = `employee-scorecard ${gradeClass}`;

        const allData = emp.types.find(t => t.type === 'รวมทั้งหมด' || t.type === 'ALL' || t.type === 'Total');
        let allRate = 0;
        if (allData && allData.rate) {
            allRate = typeof allData.rate === 'string' ? parseFloat(allData.rate.replace('%', '')) : allData.rate;
        }
        
        // --- [FIXED] ---
        // สร้าง Style ของ Gauge ด้วย JavaScript เพื่อแก้ปัญหา html2canvas
        const gaugeStyle = `background: radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(${gradeColor} ${allRate.toFixed(1)}%, #e9ecef 0);`;
        const gaugeValueStyle = `color: ${gradeColor};`;


        card.innerHTML = `
            <div class="scorecard-header">
                <div class="employee-info">
                    <h3>${emp.name || 'ไม่ระบุชื่อ'}</h3>
                    <p>ID: ${emp.id || 'N/A'} | Login: ${emp.loginTime || 'N/A'}</p>
                </div>
                <div class="grade-badge ${gradeClass}">${emp.grade || 'N/A'}</div>
            </div>
            <div class="scorecard-body">
                <div class="kpi-gauge" style="${gaugeStyle}">
                    <div class="gauge-value" style="${gaugeValueStyle}">${allRate.toFixed(1)}%</div>
                </div>
                <div class="kpi-stats">
                    <div class="stat-item">
                        <span class="label">พัสดุติดปัญหา</span>
                        <span class="value problem-value">${emp.problemParcels || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">ต้องทำเพิ่ม</span>
                        <span class="value tasks-add ${getTasksColorClass(emp.tasksToAdd || 0)}">${emp.tasksToAdd || 0}</span>
                    </div>
                </div>
            </div>
            <table class="scorecard-table">
                <thead>
                    <tr><th>ประเภท</th><th>สแกน</th><th>ปิดงาน</th><th>% ปิดงาน</th></tr>
                </thead>
                <tbody>
                    ${emp.types.map(typeData => `
                        <tr>
                            <td>${typeData.type || 'N/A'}</td>
                            <td>${typeData.scanned || 0}</td>
                            <td>${typeData.closed || 0}</td>
                            <td>${typeData.rate || '0%'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        kpiResultContainer.appendChild(card);
    });
}

    function getTasksColorClass(value) {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (numValue <= 0) return 'tasks-green';
        if (numValue <= 10) return 'tasks-orange';
        if (numValue <= 20) return 'tasks-yellow';
        return 'tasks-red';
    }

    function getGradeColorClass(grade) {
        if (!grade) return '';
        switch (grade.toUpperCase()) {
            case 'A': return 'grade-a';
            case 'B': return 'grade-b';
            case 'C': return 'grade-c';
            case 'D': return 'grade-d';
            case 'F': return 'grade-f';
            default: return '';
        }
    }

    function getGradeColor(grade) {
        if (!grade) return '#adb5bd';
        switch (grade.toUpperCase()) {
            case 'A': return '#07801bff';
            case 'B': return '#3ee232ff';
            case 'C': return '#ffd600';
            case 'D': return '#f35430ff';
            case 'F': return '#f31212ff';
            default: return '#adb5bd';
        }
    }

    async function exportDashboardAsImage() {
        const reportElement = document.getElementById('report-content');
        if (!reportElement) return;
        
        const button = document.getElementById('exportImageButton');
        button.textContent = 'กำลังสร้างรูปภาพ...';
        button.disabled = true;

        try {
            const canvas = await html2canvas(reportElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#f8f9fa'
            });
            const link = document.createElement('a');
            link.download = `kpi_courier_scorecard_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL("image/png", 1.0);
            link.click();
            button.textContent = 'บันทึกเป็นรูปภาพสำเร็จ';
            button.style.backgroundColor = '#2dce89';
        } catch (err) {
            console.error("Error creating image:", err);
            button.textContent = 'บันทึกเป็นรูปภาพ';
        } finally {
            button.disabled = false;
        }
    }
    
    async function getKpiData(cacheId) {
        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'getKpiDataFromCache', cacheId: cacheId })
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            if (result && result.success) return result.data;
            throw new Error(result.error || 'ไม่สามารถดึงข้อมูลจาก Cache ได้');
        } catch (error) {
            console.error('Failed to fetch data from cache:', error);
            throw error;
        }
    }
    
    // --- [ส่วนที่แก้ไข] ---
    // ปรับปรุงฟังก์ชันนี้ให้เรียบง่ายขึ้น
    async function initializeReport() {
        const urlParams = new URLSearchParams(window.location.search);
        const cacheId = urlParams.get('id');

        if (!cacheId) {
            document.body.innerHTML = '<div class="error-message"><h1>ไม่พบ ID สำหรับสร้างรายงาน</h1></div>';
            return;
        }

        // แสดงสถานะกำลังโหลดใน Console และบนปุ่ม
        console.log('Initializing report with cache ID:', cacheId);
        if (exportImageButton) {
            exportImageButton.textContent = 'กำลังโหลดข้อมูล...';
            exportImageButton.disabled = true;
        }
        
        try {
            const reportData = await getKpiData(cacheId);
            console.log('Report Data received:', reportData);

            if (!reportData || !reportData.tableData || !reportData.summaryData) {
                throw new Error('ข้อมูลที่ได้รับไม่สมบูรณ์');
            }
            
            // ใช้ elements ที่มีอยู่แล้วในหน้า HTML ไม่ต้องสร้างใหม่
            const processTimeElement = document.getElementById('processTimeDisplay');
            if (processTimeElement) {
                processTimeElement.textContent = `วันที่ประมวลผล: ${reportData.processTime || 'ไม่ระบุ'}`;
            }
            
            // เรียก function แสดงผลข้อมูล
            renderSummaryCards(reportData.summaryData); 
            renderCards(reportData.tableData);
            
            // เพิ่ม event listener ให้กับปุ่ม export (หากยังไม่มี)
            if (exportImageButton && !exportImageButton.onclick) {
                exportImageButton.addEventListener('click', exportDashboardAsImage);
            }

        } catch (error) {
            console.error("ไม่สามารถโหลดข้อมูลรายงานได้:", error);
            const container = document.getElementById('report-content') || document.body;
            container.innerHTML = `<div class="error-message"><h1>เกิดข้อผิดพลาดในการโหลดข้อมูล</h1><p>${error.message}</p></div>`;
        } finally {
            // คืนค่าปุ่มเมื่อทำงานเสร็จ
            if (exportImageButton) {
                exportImageButton.textContent = 'บันทึกเป็นรูปภาพ';
                exportImageButton.disabled = false;
            }
        }
    }

    // เริ่มต้นกระบวนการ
    initializeReport();
});
