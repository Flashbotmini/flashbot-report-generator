// kpi_report_generator_controller.js
document.addEventListener('DOMContentLoaded', () => {

    const exportImageButton = document.getElementById('exportImageButton');
    const processTimeDisplay = document.getElementById('processTimeDisplay');
    const kpiResultContainer = document.getElementById('kpiResultContainer');
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwWIcRczMCQGCIjoZZMXcg25AYGqozTi8tpJOIuadW5XwY8ou49G2302z9EnI593wk/exec';

    function renderSummaryCards(summary) {
        if (!summary) return;
        document.getElementById('summary_pri').innerHTML = `<div class="card-main-value">${summary.PRI.avgRate.toFixed(1)}%</div><div class="card-sub-value">${summary.PRI.closed}/${summary.PRI.scanned}</div>`;
        document.getElementById('summary_tt').innerHTML = `<div class="card-main-value">${summary.TT.avgRate.toFixed(1)}%</div><div class="card-sub-value">${summary.TT.closed}/${summary.TT.scanned}</div>`;
        document.getElementById('summary_all').innerHTML = `<div class="card-main-value">${summary.ALL.avgRate.toFixed(1)}%</div><div class="card-sub-value">${summary.ALL.closed}/${summary.ALL.scanned}</div>`;
        document.getElementById('summary_problem').innerHTML = `<span class="problem-total">${summary.problem}</span>`;
    }

    function renderCards(data) {
        if (!kpiResultContainer || !data) return;
        kpiResultContainer.innerHTML = '';

        if (data.length === 0) {
            kpiResultContainer.innerHTML = '<p>ไม่พบข้อมูลสำหรับแสดงผล</p>';
            return;
        }

        data.forEach((emp) => {
            const card = document.createElement('div');
            card.className = 'employee-scorecard';
            
            const allData = emp.types.find(t => t.type === 'รวมทั้งหมด') || { rate: '0%' };
            const allRate = parseFloat(allData.rate.replace('%', ''));
            const gradeClass = getGradeColorClass(emp.grade);

            card.innerHTML = `
                <div class="scorecard-header">
                    <div class="employee-info">
                        <h3>${emp.name}</h3>
                        <p>ID: ${emp.id} | Login: ${emp.loginTime}</p>
                    </div>
                    <div class="grade-badge ${gradeClass}">${emp.grade}</div>
                </div>
                <div class="scorecard-body">
                    <div class="kpi-gauge" style="--p:${allRate.toFixed(1)}; --c:${getGradeColor(emp.grade)};">
                        <div class="gauge-value">${allRate.toFixed(1)}%</div>
                    </div>
                    <div class="kpi-stats">
                        <div class="stat-item">
                            <span class="label">พัสดุติดปัญหา</span>
                            <span class="value problem-value">${emp.problemParcels}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">ต้องทำเพิ่ม</span>
                            <span class="value tasks-add ${getTasksColorClass(emp.tasksToAdd)}">${emp.tasksToAdd}</span>
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
                                <td>${typeData.type}</td>
                                <td>${typeData.scanned}</td>
                                <td>${typeData.closed}</td>
                                <td>${typeData.rate}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            kpiResultContainer.appendChild(card);
        });
    }

    function getTasksColorClass(value) {
        if (value <= 0) return 'tasks-green';
        if (value <= 10) return 'tasks-orange';
        if (value <= 20) return 'tasks-yellow';
        return 'tasks-red';
    }

    function getGradeColorClass(grade) {
        switch (grade) {
            case 'A': return 'grade-a';
            case 'B': return 'grade-b';
            case 'C': return 'grade-c';
            case 'D': return 'grade-d';
            case 'F': return 'grade-f';
            default: return '';
        }
    }
    
    function getGradeColor(grade) {
        switch (grade) {
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

        exportImageButton.textContent = 'กำลังสร้างรูปภาพ...';
        exportImageButton.disabled = true;

        try {
            const canvas = await html2canvas(reportElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#f8f9fa'
            });
            const link = document.createElement('a');
            link.download = `kpi_courier_scorecard_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL("image/png", 1.0);
            link.click();
        } catch (err) {
            console.error("เกิดข้อผิดพลาดในการสร้างรูปภาพ:", err);
            alert("เกิดข้อผิดพลาดในการสร้างรูปภาพ");
        } finally {
            exportImageButton.textContent = 'บันทึกเป็นรูปภาพสำเร็จ';
            exportImageButton.style.backgroundColor = '#2dce89';
        }
    }
    
    // --- [FIXED] แก้ไขฟังก์ชันนี้ให้จัดการกับ response structure ได้ถูกต้อง ---
    async function getKpiData(cacheId) {
        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'getKpiDataFromCache', cacheId: cacheId })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API Response:', result);
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'ไม่สามารถดึงข้อมูลจาก Cache ได้');
            }
        } catch (error) {
            console.error('Failed to fetch data from cache:', error);
            throw error;
        }
    }
    
    async function initializeReport() {
        const urlParams = new URLSearchParams(window.location.search);
        const cacheId = urlParams.get('id');

        if (!cacheId) {
            document.body.innerHTML = '<div class="error-message"><h1>ไม่พบ ID สำหรับสร้างรายงาน</h1><p>กรุณาตรวจสอบ URL อีกครั้ง</p></div>';
            return;
        }

        // แสดงข้อความกำลังโหลด
        document.body.innerHTML = `
            <div class="loading-container" style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
                <h1>กำลังดึงข้อมูลรายงาน...</h1>
                <p>Cache ID: ${cacheId}</p>
                <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        try {
            const reportData = await getKpiData(cacheId);
            console.log('Report Data:', reportData);
            
            if (!reportData || !reportData.tableData || !reportData.summaryData) {
                throw new Error('ข้อมูลรายงานไม่สมบูรณ์');
            }
            
            // สร้างหน้า HTML ใหม่
            document.body.innerHTML = `
                <div class="report-container">
                    <div id="report-content">
                        <h1>KPI COURIER SCORECARD</h1>
                        <div class="kpi-header-info" style="text-align: right; border-bottom: none;">
                            <span id="processTimeDisplay"></span>
                        </div>
                        <div class="kpi-grid-container courier-summary">
                            <div class="kpi-card" id="summary_pri_card">
                                <div class="card-header">PRIORITY</div>
                                <div id="summary_pri" class="card-body"></div>
                            </div>
                            <div class="kpi-card" id="summary_tt_card">
                                <div class="card-header">TIKTOK</div>
                                <div id="summary_tt" class="card-body"></div>
                            </div>
                            <div class="kpi-card" id="summary_all_card">
                                <div class="card-header">ALL</div>
                                <div id="summary_all" class="card-body"></div>
                            </div>
                            <div class="kpi-card" id="summary_problem_card">
                                <div class="card-header">พัสดุติดปัญหา</div>
                                <div id="summary_problem" class="card-body"></div>
                            </div>
                        </div>
                        <div id="kpiResultContainer" class="kpi-card-view-container"></div>
                    </div>
                    <div class="kpi-actions">
                        <button id="exportImageButton">บันทึกเป็นรูปภาพ</button>
                    </div>
                </div>`;
            
            // อัปเดตข้อมูลในหน้า
            document.getElementById('processTimeDisplay').textContent = `วันที่ประมวลผล: ${reportData.processTime}`;
            renderSummaryCards(reportData.summaryData); 
            renderCards(reportData.tableData);
            
            // เพิ่ม event listener สำหรับปุ่ม export
            document.getElementById('exportImageButton').addEventListener('click', exportDashboardAsImage);
            
            console.log('Report initialized successfully');

        } catch (error) {
            console.error("ไม่สามารถโหลดข้อมูลได้:", error);
            document.body.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 50px;">
                    <h1>เกิดข้อผิดพลาด</h1>
                    <p>${error.message}</p>
                    <p style="color: #666; font-size: 0.9em;">Cache ID: ${cacheId}</p>
                    <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">ปิดหน้าต่าง</button>
                </div>
            `;
        }
    }

    // เริ่มต้นรายงาน
    initializeReport();
});
