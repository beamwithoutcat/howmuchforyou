document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', function() {
        const parent = this.parentNode;
        parent.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        if (parent.id === 'maritalStatus') {
            if (this.dataset.value === 'married') {
                document.getElementById('pastWeddingBlock').classList.remove('hidden');
                document.getElementById('futureGiftBlock').classList.add('hidden');
            } else {
                document.getElementById('pastWeddingBlock').classList.add('hidden');
                document.getElementById('futureGiftBlock').classList.remove('hidden');
            }
        }
        updateQuestions();
    });
});

document.getElementById('closeness').addEventListener('input', function() {
    document.getElementById('closenessValue').textContent = this.value;
});

function updateQuestions() {
    const name = document.getElementById('brideGroomName').value;
    const weddingDate = document.getElementById('weddingDate').value;
    if (name) {
        document.getElementById('relationshipLabel').innerText = `${name}씨는 당신과 어떤 관계인가요?`;
        document.getElementById('pastWeddingGiftLabel').innerText = `${name}씨가 당신의 결혼식에서 낸 축의금 (만원)`;
        document.getElementById('expectedTreatmentLabel').innerText = `이 결혼식이 끝난 뒤 ${name}씨가 당신을 어떻게 대하기를 바라나요?`;
        document.getElementById('attendingLabel').innerText = `${name}씨의 결혼식에 참석하실 예정인가요?`;
        document.getElementById('futureGiftLabel').innerText = `언젠가 당신의 결혼식에 참석한 ${name}씨는 축의금으로 얼마를 낼까요?`;
    } else {
        document.getElementById('relationshipLabel').innerText = `결혼 주인공은 당신과 어떤 관계인가요?`;
        document.getElementById('pastWeddingGiftLabel').innerText = `결혼 주인공이 당신의 결혼식에서 낸 축의금 (만원)`;
        document.getElementById('expectedTreatmentLabel').innerText = `결혼식 후 결혼 주인공이 당신을 어떻게 대하기를 바라는가?`;
        document.getElementById('attendingLabel').innerText = `결혼 주인공의 결혼식에 참석하시나요?`;
        document.getElementById('futureGiftLabel').innerText = `미래에 당신의 결혼식에서 결혼 주인공이 낼 축의금 (만원)`;
    }
}

function calculateAmount() {
    const brideGroomName = document.getElementById('brideGroomName').value;
    const relationship = document.querySelector('#relationship .selected')?.getAttribute('data-value');
    const closeness = parseInt(document.getElementById('closeness').value);
    const maritalStatus = document.querySelector('#maritalStatus .selected')?.getAttribute('data-value');
    const pastWeddingGift = parseInt(document.getElementById('pastWeddingGift').value);
    const attendance = document.querySelector('#attendance .selected')?.getAttribute('data-value');
    const weddingScale = document.querySelector('#weddingScale .selected')?.getAttribute('data-value');
    const expectedTreatment = document.querySelector('#expectedTreatment .selected')?.getAttribute('data-value');
    const maxAmount = parseInt(document.getElementById('maxAmount').value);

    if (!brideGroomName || !relationship || isNaN(closeness) || !maritalStatus || !attendance || !weddingScale || !expectedTreatment || isNaN(maxAmount)) {
        document.getElementById('result').innerText = "모든 질문에 답변을 선택하고 상한선을 입력해주세요.";
        return;
    }

    let amount = 0;

    // 친밀도에 따른 기본 금액
    amount += (10 - closeness) * 2;

    // 관계에 따른 가중치
    if (relationship === 'family') amount += 20;
    if (relationship === 'friend') amount += 15;
    if (relationship === 'colleague') amount += 10;
    if (relationship === 'other') amount += 5;

    // 기혼 여부 및 주인공이 낸 축의금
    if (maritalStatus === 'married') {
        amount += isNaN(pastWeddingGift) ? 0 : pastWeddingGift;
    }

    // 참석 여부에 따른 조정
    if (attendance === 'no') {
        amount = 0;
    } else {
        if (weddingScale === 'small') amount += 5;
        if (weddingScale === 'medium') amount += 10;
        if (weddingScale === 'large') amount += 15;
    }

    // 기대하는 대우에 따른 가중치
    if (expectedTreatment === 'respect') amount += 10;
    if (expectedTreatment === 'emotion') amount += 7;
    if (expectedTreatment === 'neutral') amount += 5;
    if (expectedTreatment === 'doubt') amount += 3;
    if (expectedTreatment === 'dislike') amount -= 10;

    // 최종 상한선 조정
    if (amount > maxAmount) amount = maxAmount;

    // 결과 도출
    let resultText;
    if (amount <= 0) {
        resultText = "가지 않고 내지 않는다";
    } else if (amount <= 5) {
        resultText = "5만원";
    } else if (amount <= 7) {
        resultText = "7만원";
    } else if (amount <= 10) {
        resultText = "10만원";
    } else if (amount <= 15) {
        resultText = "15만원";
    } else if (amount <= 20) {
        resultText = "20만원";
    } else {
        resultText = "20만원 이상";
    }

    // 결혼식 예절 상식
    let etiquetteTip = '';
    if (resultText === "가지 않고 내지 않는다") {
        etiquetteTip = "적절하지 못한 축의금는 관계를 깨트릴 위험이 있습니다.";
    } else if (resultText === "5만원" || resultText === "7만원" || resultText === "10만원") {
        etiquetteTip = "일반적인 축의금은 5~10만원입니다. 결혼식에 참석하는 경우 이 금액이 적당합니다.";
    } else if (resultText === "20만원 이상") {
        etiquetteTip = "상한선 내에서 자유롭게 내시면 됩니다.";
    }

    // 결과 표시
    const resultElement = document.getElementById('result');
    resultElement.classList.remove('show');
    void resultElement.offsetWidth; // 리플로우 강제
    resultElement.classList.add('show');
    resultElement.innerText = `${brideGroomName}님을 위해 추천되는 축의금은 ${resultText}입니다.`;

    // 예절 상식 표시
    const etiquetteElement = document.getElementById('etiquetteTip');
    etiquetteElement.innerText = etiquetteTip;
}