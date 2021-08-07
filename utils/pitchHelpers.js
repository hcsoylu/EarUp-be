exports.calculateAvg = (pitchArray) => {
  let totalScore = 0;
  for (let pitch of pitchArray) {
    totalScore += pitch.score;
  }

  const avg = totalScore / pitchArray.length;
  return avg;
};

exports.getLeaderBoard = (userArray, quizType) => {
  const QUIZ_SIZE = 3;
  if (quizType === "easy") {
    if (userArray.easyPitches.length >= QUIZ_SIZE) {
      return userArray;
    }
  }
};
