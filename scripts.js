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
    const futureGiftAmount = parseInt(document.getElementById('futureGiftAmount').value);
    const attendance = document.querySelector('#attendance .selected')?.getAttribute('data-value');
    const weddingScale = document.querySelector('#weddingScale .selected')?.getAttribute('data-value');
    const expectedTreatment = document.querySelector('#expectedTreatment .selected')?.getAttribute('data-value');
    const maxAmount = parseInt(document.getElementById('maxAmount').value);

    if (!brideGroomName || !relationship || isNaN(closeness) || !maritalStatus || !weddingScale || !expectedTreatment || isNaN(maxAmount)) {
        document.getElementById('result').innerText = "모든 질문에 답변을 선택하고 상한선을 입력해주세요.";
        return;
    }

    let baseAmount = 0;

    // 친밀도와 관계의 곱을 반영
    const relationshipWeights = {
        'family': 5,
        'friend': 3,
        'colleague': 2,
        'other': 1
    };
    const relationshipWeight = relationshipWeights[relationship] || 0;
    baseAmount += relationshipWeight * (closeness / 20); // 친밀도의 영향을 줄이기 위해 나누기

    // 기혼 여부 및 주인공이 낸 축의금, 미혼일 경우 예상 축의금
    let averageGift;
    if (maritalStatus === 'married') {
        averageGift = isNaN(pastWeddingGift) ? 0 : pastWeddingGift;
    } else {
        averageGift = isNaN(futureGiftAmount) ? 0 : futureGiftAmount;
    }

    // 평균 축의금 반영
    baseAmount = (baseAmount + averageGift) / 2;

    // 웨딩 규모에 따른 가중치
    const weddingScaleWeights = {
        'small': 1,
        'medium': 2,
        'large': 4
    };
    baseAmount += weddingScaleWeights[weddingScale] || 0;

    // 기대하는 대우에 따른 가중치
    const treatmentWeights = {
        'respect': 5,
        'emotion': 2,
        'neutral': 0,
        'doubt': -2,
        'dislike': -10
    };
    baseAmount += treatmentWeights[expectedTreatment] || 0;

    // 참석 여부에 따른 조정
    if (attendance === 'yes') {
        baseAmount += 2; // 참석시 추가 금액
    }

    // 상한선 조정
    let finalAmount;
    if (expectedTreatment === 'emotion') {
        finalAmount = baseAmount * 1.3; // '감동' 클릭 시 30% 추가
    } else if (expectedTreatment === 'respect') {
        finalAmount = baseAmount * 1.6; // '존경' 클릭 시 60% 추가
    } else if (baseAmount > maxAmount && expectedTreatment !== 'neutral') {
        finalAmount = maxAmount; // '감동' 이하 경우에는 상한선 초과하지 않음
    } else {
        finalAmount = Math.min(baseAmount, maxAmount);
    }

    // 축의금 범위 조정
    finalAmount = Math.max(0, finalAmount);

    // 결과 도출
    let resultText;
    if (finalAmount <= 0) {
        resultText = "가지 않고 내지 않는다";
    } else if (finalAmount <= 5) {
        resultText = "5만원";
    } else if (finalAmount <= 7) {
        resultText = "7만원";
    } else if (finalAmount <= 10) {
        resultText = "10만원";
    } else if (finalAmount <= 15) {
        resultText = "15만원";
    } else if (finalAmount <= 20) {
        resultText = "20만원";
    } else {
        resultText = "20만원 이상";
    }

    // 결혼식 예절 상식
    let etiquetteTip = '';
    if (resultText === "가지 않고 내지 않는다") {
        etiquetteTip = "적절하지 못한 축의금은 관계를 깨트릴 위험이 있습니다.";
    } else if (resultText === "5만원" || resultText === "7만원" || resultText === "10만원") {
        etiquetteTip = "일반적인 축의금은 5~10만원입니다. 결혼식에 참석하는 경우 이 금액이 적당합니다.";
    } else if (resultText === "20만원") {
        etiquetteTip = "아주 가까운 사이라면 20만원의 축의금은 적절할 수 있습니다.";
    } else if (resultText === "20만원 이상") {
        etiquetteTip = "여유가 되는 선에서 결혼을 축복하시는 만큼 자유롭게.";
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