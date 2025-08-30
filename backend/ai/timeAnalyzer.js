import * as tf from "@tensorflow/tfjs";

/**
 * logs = [{subject: 'Math', duration: 30}, {subject: 'English', duration: 20}, ...]
 * คืนค่าเป็น object { predictions: [{subject, predicted, recommendation}], summaryRecommendation: string }
 */
export const analyzeLogs = async (logs) => {
    if (!logs || logs.length === 0) {
        return { predictions: [], summaryRecommendation: "ไม่มีข้อมูล log ให้วิเคราะห์" };
    }

    const MIN_DURATION = 15; // นาที ต่ำสุดที่ควรเรียนต่อครั้ง
    const MAX_DURATION = 120; // นาที สูงสุดที่เหมาะสมต่อครั้ง

    // แปลงวิชาเป็นตัวเลข
    const subjects = [...new Set(logs.map(log => log.subject))];
    const subjectToId = Object.fromEntries(subjects.map((s,i) => [s,i]));

    // คำนวณค่าเฉลี่ยเวลาเรียนแต่ละวิชา
    const avgTimes = {};
    subjects.forEach(sub => {
        const subLogs = logs.filter(l => l.subject === sub).map(l => l.duration);
        avgTimes[sub] = subLogs.reduce((a,b)=>a+b,0)/subLogs.length;
    });

    // เตรียมข้อมูล model
    const xs = tf.tensor2d(logs.map((log,i) => [i, subjectToId[log.subject]]));
    const ys = tf.tensor2d(logs.map(log => [log.duration]));

    // สร้าง model แบบ small dense
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 8, inputShape: [2], activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });

    await model.fit(xs, ys, { epochs: 200 });

    // ทำนายเวลาต่อไปของแต่ละวิชาและให้คำแนะนำ
    const predictions = [];
    let totalDiff = 0;

    for (let i = 0; i < subjects.length; i++) {
        const nextIndex = logs.length;
        const input = tf.tensor2d([[nextIndex, i]]);
        const pred = (await model.predict(input).data())[0];

        const currentAvg = avgTimes[subjects[i]];
        const diff = pred - currentAvg;
        totalDiff += diff;

        let recommendation = "";

        if (currentAvg < MIN_DURATION) {
            recommendation = `เวลาน้อยเกินไป ควรเพิ่มเวลาเรียนอย่างน้อย ${(MIN_DURATION - currentAvg).toFixed(1)} นาที`;
        } else if (pred > MAX_DURATION) {
            recommendation = `เวลามากเกินไป ควรพักบ้าง`;
        } else {
            const changeRate = diff / currentAvg;
            if (changeRate > 0.2) recommendation = `ควรเพิ่มเวลาเรียนประมาณ ${diff.toFixed(1)} นาที`;
            else if (changeRate < -0.2) recommendation = `ควรลดเวลาเรียนประมาณ ${Math.abs(diff).toFixed(1)} นาที`;
            else recommendation = "เวลาการเรียนเหมาะสมแล้ว";
        }

        predictions.push({ subject: subjects[i], predicted: pred.toFixed(1), recommendation });
    }

    let summaryRecommendation = "";
    if (totalDiff > 20) summaryRecommendation = "โดยรวมควรเพิ่มเวลาเรียน";
    else if (totalDiff < -20) summaryRecommendation = "โดยรวมควรลดเวลาเรียน";
    else summaryRecommendation = "เวลาการเรียนโดยรวมเหมาะสมแล้ว";

    return { predictions, summaryRecommendation };
};
