// kpi_report_generator_controller.js
document.addEventListener('DOMContentLoaded', () => {

    const exportImageButton = document.getElementById('exportImageButton');
    const processTimeDisplay = document.getElementById('processTimeDisplay');
    const kpiResultContainer = document.getElementById('kpiResultContainer');

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
                    <div class="kpi-gauge ${gradeClass}" style="--p:${allRate.toFixed(1)};"></div>
                    <div class="kpi-stats">
                        <div class="stat-item">
                            <span class="label">พัสดุติดปัญหา</span>
                            <span class="value problem-value">${emp.problemParcels}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">ต้องปิดงานเพิ่ม</span>
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

    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    if (dataParam) {
        try {
            const jsonString = decodeURIComponent(escape(atob(dataParam.replace(/ /g, '+'))));
            const decodedData = JSON.parse(jsonString);
            
            processTimeDisplay.textContent = `วันที่ประมวลผล: ${decodedData.processTime}`;
            renderCards(decodedData.tableData);
        } catch (e) {
            console.error("ไม่สามารถถอดรหัสข้อมูลได้:", e);
            document.body.innerHTML = '<h1>เกิดข้อผิดพลาด: ไม่สามารถแสดงข้อมูลได้</h1>';
        }
    } else {
         document.body.innerHTML = '<h1>ไม่พบข้อมูลสำหรับสร้างรายงาน</h1>';
    }

    exportImageButton.addEventListener('click', exportDashboardAsImage);
});
