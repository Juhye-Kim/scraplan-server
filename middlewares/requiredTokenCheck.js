//requiredTokenCheck의 경우 모든 값들이 필요하다.
//optionalTokenCheck의 경우 authorization값이 있다면 email값또한 필수적으로 존재해야 한다.
//즉 옵션으로 칭할 수 있지만 하나의 요소가 존재하면 두 요소다 존재해야 사용자가 멤버인지 확인한다.
//사용자가 권한이 있는지는 개별 기능에서 각자 알아서 수행한다.

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  const { email } = req.body;

  if (!authorization || !email) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  await require("./tokenCheckCore")(req, res, next, authorization, email);
};
