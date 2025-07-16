// kpi_report_generator_controller.js - แก้ไขปัญหาการแสดงข้อมูล
document.addEventListener('DOMContentLoaded', () => {

    const exportImageButton = document.getElementById('exportImageButton');
    const processTimeDisplay = document.getElementById('processTimeDisplay');
    const kpiResultContainer = document.getElementById('kpiResultContainer');
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

    function renderCards(data) {
        console.log('renderCards called with data:', data);
        
        if (!kpiResultContainer) {
            console.error('kpiResultContainer element not found');
            return;
        }
        
        if (!data) {
            console.error('Data is null or undefined');
            kpiResultContainer.innerHTML = '<p style="text-align: center; color: #666;">ไม่พบข้อมูลสำหรับแสดงผล</p>';
            return;
        }

        if (!Array.isArray(data)) {
            console.error('Data is not an array:', typeof data);
            kpiResultContainer.innerHTML = '<p style="text-align: center; color: #666;">ข้อมูลไม่อยู่ในรูปแบบที่ถูกต้อง</p>';
            return;
        }

        if (data.length === 0) {
            console.warn('Data array is empty');
            kpiResultContainer.innerHTML = '<p style="text-align: center; color: #666;">ไม่พบข้อมูลสำหรับแสดงผล</p>';
            return;
        }

        console.log(`Rendering ${data.length} employee cards`);
        kpiResultContainer.innerHTML = '';

        data.forEach((emp, index) => {
            console.log(`Processing employee ${index}:`, emp);
            
            if (!emp || !emp.types || !Array.isArray(emp.types)) {
                console.error(`Invalid employee data at index ${index}:`, emp);
                return;
            }

            const card = document.createElement('div');
            card.className = 'employee-scorecard';
            
            // ปรับปรุงการหาข้อมูล "รวมทั้งหมด"
            const allData = emp.types.find(t => t.type === 'รวมทั้งหมด' || t.type === 'ALL' || t.type === 'Total');
            console.log('Found allData:', allData);
            
            let allRate = 0;
            if (allData && allData.rate) {
                if (typeof allData.rate === 'string') {
                    allRate = parseFloat(allData.rate.replace('%', ''));
                } else if (typeof allData.rate === 'number') {
                    allRate = allData.rate;
                }
            }
            
            const gradeClass = getGradeColorClass(emp.grade);
            const gradeColor = getGradeColor(emp.grade);

            card.innerHTML = `
                <div class="scorecard-header">
                    <div class="employee-info">
                        <h3>${emp.name || 'ไม่ระบุชื่อ'}</h3>
                        <p>ID: ${emp.id || 'N/A'} | Login: ${emp.loginTime || 'N/A'}</p>
                    </div>
                    <div class="grade-badge ${gradeClass}">${emp.grade || 'N/A'}</div>
                </div>
                <div class="scorecard-body">
                    <div class="kpi-gauge" style="--p:${allRate.toFixed(1)}; --c:${gradeColor};">
                        <div class="gauge-value">${allRate.toFixed(1)}%</div>
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
            console.log(`Added card for employee: ${emp.name}`);
        });
        
        console.log('All cards rendered successfully');
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
        if (!reportElement) {
            console.error('Report element not found');
            return;
        }

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
            
            exportImageButton.textContent = 'บันทึกเป็นรูปภาพสำเร็จ';
            exportImageButton.style.backgroundColor = '#2dce89';
        } catch (err) {
            console.error("เกิดข้อผิดพลาดในการสร้างรูปภาพ:", err);
            alert("เกิดข้อผิดพลาดในการสร้างรูปภาพ");
            exportImageButton.textContent = 'บันทึกเป็นรูปภาพ';
            exportImageButton.disabled = false;
        }
    }
    
    async function getKpiData(cacheId) {
        try {
            console.log('Fetching data for cache ID:', cacheId);
            
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
            
            if (result && result.success) {
                console.log('Data fetched successfully:', result.data);
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

        console.log('Initializing report with cache ID:', cacheId);

        if (!cacheId) {
            console.error('No cache ID provided');
            document.body.innerHTML = '<div class="error-message"><h1>ไม่พบ ID สำหรับสร้างรายงาน</h1><p>กรุณาตรวจสอบ URL อีกครั้ง</p></div>';
            return;
        }

        // แสดงข้อความกำลังโหลด
        const loadingHTML = `
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
        
        document.body.innerHTML = loadingHTML;
        
        try {
            const reportData = await getKpiData(cacheId);
            console.log('Report Data received:', reportData);
            
            if (!reportData) {
                throw new Error('ไม่พบข้อมูลรายงาน');
            }
            
            if (!reportData.tableData) {
                throw new Error('ไม่พบข้อมูลตาราง');
            }
            
            if (!reportData.summaryData) {
                throw new Error('ไม่พบข้อมูลสรุป');
            }
            
            // สร้างหน้า HTML ใหม่
            const reportHTML = `
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
            
            document.body.innerHTML = reportHTML;
            
            // อัปเดตข้อมูลในหน้า
            const processTimeElement = document.getElementById('processTimeDisplay');
            if (processTimeElement) {
                processTimeElement.textContent = `วันที่ประมวลผล: ${reportData.processTime || 'ไม่ระบุ'}`;
            }
            
            // เรียก function แสดงผล
            renderSummaryCards(reportData.summaryData); 
            renderCards(reportData.tableData);
            
            // เพิ่ม event listener สำหรับปุ่ม export
            const newExportButton = document.getElementById('exportImageButton');
            if (newExportButton) {
                newExportButton.addEventListener('click', exportDashboardAsImage);
            }
            
            console.log('Report initialized successfully');

        } catch (error) {
            console.error("ไม่สามารถโหลดข้อมูลได้:", error);
            const errorHTML = `
                <div class="error-message" style="text-align: center; padding: 50px;">
                    <h1>เกิดข้อผิดพลาด</h1>
                    <p>${error.message}</p>
                    <p style="color: #666; font-size: 0.9em;">Cache ID: ${cacheId}</p>
                    <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">ลองใหม่</button>
                    <button onclick="window.close()" style="margin-top: 20px; margin-left: 10px; padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">ปิดหน้าต่าง</button>
                </div>
            `;
            document.body.innerHTML = errorHTML;
        }
    }

    // เริ่มต้นรายงาน
    initializeReport();
});
