// js/views/popup_courier_kpi_controller.js
document.addEventListener('DOMContentLoaded', () => {

    let processedDataCache = null;

    // --- DOM Elements ---
    const backToMenuButton = document.getElementById('backToMenuButton');
    const logoutButton = document.getElementById('logoutButton');
    const processFileButton = document.getElementById('processFileButton');
    const kpiFileInput = document.getElementById('kpiFileInput');
    const targetGoalInput = document.getElementById('targetGoalInput');
    const loadingMessage = document.getElementById('loadingMessage');
    const exportImageButton = document.getElementById('exportImageButton');
    const processTimeDisplay = document.getElementById('processTimeDisplay');
    const kpiResultContainer = document.getElementById('kpiResultContainer'); // --- Element for cards ---

    // --- Initial Setup ---
    (function initializePage() {
        chrome.storage.local.get(['userId', 'userEmail'], (result) => {
            if (result.userId && document.getElementById('kpiUserEmail')) {
                document.getElementById('kpiUserEmail').textContent = result.userEmail;
            } else {
                if (typeof window.clearSessionAndRedirectToLogin === 'function') {
                    window.clearSessionAndRedirectToLogin();
                }
            }
        });
        setupEventListeners();
    })();

    function setupEventListeners() {
        if (backToMenuButton) backToMenuButton.addEventListener('click', () => { window.location.href = 'popup_menu_member.html'; });
        if (logoutButton) logoutButton.addEventListener('click', () => { window.handleLogout && window.handleLogout(); });
        if (processFileButton) processFileButton.addEventListener('click', () => handleFileProcessing(false));
        if (exportImageButton) exportImageButton.addEventListener('click', exportDashboardAsImage);
        if (targetGoalInput) targetGoalInput.addEventListener('change', () => handleFileProcessing(true));
    }

    function handleFileProcessing(isRecalculation = false) {
        const file = kpiFileInput.files[0];
        if (!file && !processedDataCache) {
            alert('กรุณาเลือกไฟล์ Excel หรือ CSV');
            return;
        }

        loadingMessage.textContent = 'กำลังประมวลผล...';
        loadingMessage.style.display = 'block';
        processFileButton.disabled = true;

        const processData = (csvContent) => {
            try {
                const targetGoal = parseFloat(targetGoalInput.value) || 95.0;
                processedDataCache = csvContent;

                const { finalData, summary } = processCourierData(csvContent, targetGoal);

                renderSummaryCards(summary);
                renderCards(finalData); // --- Call new render function ---
                processTimeDisplay.textContent = `วันที่ประมวลผล: ${new Date().toLocaleString('th-TH')}`;

            } catch (error) {
                alert(`เกิดข้อผิดพลาดในการประมวลผลไฟล์: ${error.message}`);
                console.error(error);
            } finally {
                loadingMessage.style.display = 'none';
                processFileButton.disabled = false;
            }
        };

        if (isRecalculation && processedDataCache) {
            processData(processedDataCache);
        } else if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileContent = event.target.result;
                try {
                    const workbook = XLSX.read(fileContent, { type: 'binary', cellDates: true });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
                    processData(csvContent);
                } catch (readError) {
                    alert('ไม่สามารถอ่านไฟล์ได้ อาจเป็นไฟล์ที่ไม่รองรับหรือเสียหาย');
                    console.error("File read error:", readError);
                    loadingMessage.style.display = 'none';
                    processFileButton.disabled = false;
                }
            };
            reader.readAsBinaryString(file);
        } else {
            loadingMessage.style.display = 'none';
            processFileButton.disabled = false;
        }
    }

    function renderSummaryCards(summary) {
        document.getElementById('summary_pri').innerHTML = `<b>Scanned:</b> ${summary.PRI.scanned}<br><b>Closed:</b> ${summary.PRI.closed}<br><b>Avg Rate:</b> ${summary.PRI.avgRate.toFixed(2)}%`;
        document.getElementById('summary_tt').innerHTML = `<b>Scanned:</b> ${summary.TT.scanned}<br><b>Closed:</b> ${summary.TT.closed}<br><b>Avg Rate:</b> ${summary.TT.avgRate.toFixed(2)}%`;
        document.getElementById('summary_all').innerHTML = `<b>Scanned:</b> ${summary.ALL.scanned}<br><b>Closed:</b> ${summary.ALL.closed}<br><b>Avg Rate:</b> ${summary.ALL.avgRate.toFixed(2)}%`;
        document.getElementById('summary_problem').innerHTML = `<span class="problem-total">${summary.problem}</span>`;
    }

    function renderCards(data) {
        if (!kpiResultContainer) return;
        kpiResultContainer.innerHTML = '';

        if (!data || data.length === 0) {
            kpiResultContainer.innerHTML = '<p style="text-align:center; color:#888;">ไม่พบข้อมูลพนักงานสำหรับแสดงผล</p>';
            return;
        }

        data.forEach((emp) => {
            const card = document.createElement('div');
            card.className = 'employee-kpi-card';

            const cardHeader = `
                <div class="card-title">
                    <h2>${emp.name}</h2>
                    <p>ID: ${emp.id} | Login: ${emp.loginTime}</p>
                </div>
                <div class="card-summary">
                    <div class="summary-item">
                        <span class="label">เกรด</span>
                        <span class="value grade-cell ${getGradeColorClass(emp.grade)}">${emp.grade}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">ติดปัญหา</span>
                        <span class="value problem-value">${emp.problemParcels}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">ต้องทำเพิ่ม</span>
                        <span class="value tasks-add ${getTasksColorClass(emp.tasksToAdd)}">${emp.tasksToAdd}</span>
                    </div>
                </div>
            `;

            const cardTable = document.createElement('table');
            cardTable.className = 'mini-kpi-table';
            cardTable.innerHTML = `
                <thead>
                    <tr>
                        <th>ประเภท</th>
                        <th>สแกน</th>
                        <th>ปิดงาน</th>
                        <th>% ปิดงาน</th>
                    </tr>
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
            `;

            card.innerHTML = cardHeader;
            card.appendChild(cardTable);
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

    function exportDashboardAsImage() {
        const { finalData, summary } = processCourierData(processedDataCache, parseFloat(targetGoalInput.value) || 95.0);

        if (!finalData || finalData.length === 0) {
            alert("กรุณาประมวลผลข้อมูลก่อนบันทึกรูปภาพ");
            return;
        }

        const generatorUrl = 'https://flashbotmini.github.io/flashbot-report-generator/kpi_report_generator.html';

        const dataToSend = {
            processTime: new Date().toLocaleString('th-TH'),
            tableData: finalData,
            summaryData: summary
        };

        try {
            const jsonString = JSON.stringify(dataToSend);
            const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
            const finalUrl = `${generatorUrl}?data=${encodedData}`;
            chrome.tabs.create({ url: finalUrl });
        } catch (e) {
            console.error("เกิดข้อผิดพลาดในการเข้ารหัสข้อมูล:", e);
            alert("เกิดข้อผิดพลาดในการเตรียมข้อมูลเพื่อส่งออก");
        }
    }
});
