// kpi_report_generator_controller.js
document.addEventListener('DOMContentLoaded', () => {

    const kpiTableBody = document.getElementById('kpiTableBody');
    const exportImageButton = document.getElementById('exportImageButton');
    const processTimeDisplay = document.getElementById('processTimeDisplay');

    function renderTable(data) {
        if (!kpiTableBody || !data) return;
        kpiTableBody.innerHTML = '';
        data.forEach((emp) => {
            emp.types.forEach((typeData, typeIndex) => {
                const row = kpiTableBody.insertRow();
                if (typeIndex === 0) {
                    row.innerHTML += `<td rowspan="3" class="cell-center">${emp.id}</td>`;
                    row.innerHTML += `<td rowspan="3" class="cell-center">${emp.name}</td>`;
                    row.innerHTML += `<td rowspan="3" class="cell-center">${emp.loginTime}</td>`;
                }
                row.innerHTML += `<td>${typeData.type}</td>`;
                row.innerHTML += `<td>${typeData.scanned}</td>`;
                row.innerHTML += `<td>${typeData.closed}</td>`;
                row.innerHTML += `<td>${typeData.rate}</td>`;
                if (typeIndex === 0) {
                    row.innerHTML += `<td rowspan="3" class="cell-center">${emp.problemParcels}</td>`;
                    row.innerHTML += `<td rowspan="3" class="cell-center"><span class="tasks-add ${getTasksColorClass(emp.tasksToAdd)}">${emp.tasksToAdd}</span></td>`;
                    row.innerHTML += `<td rowspan="3" class="cell-center grade-cell ${getGradeColorClass(emp.grade)}">${emp.grade}</td>`;
                }
            });
        });
    }

    function renderSummaryCards(summary) {
        if (!summary) return;
        document.getElementById('summary_pri').innerHTML = `<b>Scanned:</b> ${summary.PRI.scanned}<br><b>Closed:</b> ${summary.PRI.closed}<br><b>Avg Rate:</b> ${summary.PRI.avgRate.toFixed(2)}%`;
        document.getElementById('summary_tt').innerHTML = `<b>Scanned:</b> ${summary.TT.scanned}<br><b>Closed:</b> ${summary.TT.closed}<br><b>Avg Rate:</b> ${summary.TT.avgRate.toFixed(2)}%`;
        document.getElementById('summary_all').innerHTML = `<b>Scanned:</b> ${summary.ALL.scanned}<br><b>Closed:</b> ${summary.ALL.closed}<br><b>Avg Rate:</b> ${summary.ALL.avgRate.toFixed(2)}%`;
        document.getElementById('summary_problem').innerHTML = `<span class="problem-total">${summary.problem}</span>`;
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
        if (!reportElement) {
            alert("ไม่พบเนื้อหาสำหรับสร้างรายงาน");
            return;
        }

        exportImageButton.textContent = 'กำลังสร้างรูปภาพ...';
        exportImageButton.disabled = true;

        try {
            const canvas = await html2canvas(reportElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#f4f6f8'
            });
            const link = document.createElement('a');
            link.download = `kpi_courier_report_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL("image/png", 1.0);
            link.click();
        } catch (err) {
            console.error("เกิดข้อผิดพลาดในการสร้างรูปภาพ:", err);
            alert("เกิดข้อผิดพลาดในการสร้างรูปภาพ");
        } finally {
            exportImageButton.textContent = 'บันทึกเป็นรูปภาพสำเร็จ';
            exportImageButton.style.backgroundColor = '#27ae60';
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    if (dataParam) {
        try {
            const jsonString = decodeURIComponent(escape(atob(dataParam.replace(/ /g, '+'))));
            const decodedData = JSON.parse(jsonString);
            
            processTimeDisplay.textContent = `วันที่ประมวลผล: ${decodedData.processTime}`;
            renderSummaryCards(decodedData.summaryData); 
            renderTable(decodedData.tableData);
        } catch (e) {
            console.error("ไม่สามารถถอดรหัสข้อมูลได้:", e);
            document.body.innerHTML = '<h1>เกิดข้อผิดพลาด: ไม่สามารถแสดงข้อมูลได้</h1>';
        }
    } else {
         document.body.innerHTML = '<h1>ไม่พบข้อมูลสำหรับสร้างรายงาน</h1>';
    }

    exportImageButton.addEventListener('click', exportDashboardAsImage);
});
