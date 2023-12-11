const User = require("../Models/User")
const bcrypt = require("bcryptjs");
const jsonWebToken = require("jsonwebtoken");

const signUp = async (req, res, next) => {
  let existingUser;
  const { name, email, password } = req.body;
  existingUser = await User.findOne({ email: email });
  if (existingUser) {
    return res.status(400).json("User Already Existed");
  }
  const cipherText = bcrypt.hashSync(password);

  const user = new User({
    name: name,
    email: email,
    password: cipherText,
  });

  await user.save();
  return res.status(201).json({ message: user });
};

const login = async (req, res) => {
    console.log(req.body)
  const { email, password } = req.body;

  let userExisted;
  userExisted = await User.findOne({ email: email });
  if (!userExisted) {
    return res.status(400).json({ message: "Please Check Credentials" });
  }
  const validPassword = bcrypt.compareSync(password, userExisted.password);

  if (!validPassword) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }
  const userToken = jsonWebToken.sign(
    { id: userExisted._id },
    process.env.WEB_TOKEN_SECRET,
    {
      expiresIn: "35s",
    }
  );

  console.log("ok token", userToken);

  if (req.cookies[`${userExisted._id}`]) {
    req.cookies[`${userExisted._id}`] = "";
  }

  res.cookie(String(userExisted._id), userToken, {
    path: "/",
    expires: new Date(Date.now() + 1000 * 30),
    httpOnly: true,
    sameSite: "lax",
  });

  return res
    .status(200)
    .json({ message: "success", user: userExisted, userToken });
};

const userVerification = (req, res, next) => {
  const cookie = req.headers.cookie;
  console.log(cookie);
  const token = cookie.split("=")[1];
  console.log(token);
  if (!token) {
    res.status(404).json({ message: "Invalid Credentials: Token Error" });
  }
  jsonWebToken.verify(
    token.toString(), // String(token)
    process.env.WEB_TOKEN_SECRET,
    (error, user) => {
      if (error) {
        return res
          .status(400)
          .json({ message: "Invalid Credentials: token error" });
      }
      console.log(user.id);
      req.id = user.id;
    }
  );
  next();
};

const getUser = async (req, res, next) => {
  const userId = req.id;
  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (error) {
    return new Error(error);
  }
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }
  return res.status(200).json({ user });
};

const refreshToken = (req, res, next) => {
  const cookie = req.headers.cookie;

  console.log(cookie);
  const oldToken = cookie.split("=")[1]; //previous token

  if (!oldToken) {
    return res.status(400).json({ message: "Something Went Wrong" });
  }
  jsonWebToken.verify(
    String(oldToken),
    process.env.WEB_TOKEN_SECRET,
    (error, user) => {
      if (error) {
        console.log(error);
        return res.status(403).json({ message: "Authentication Failed" });
      }

      res.clearCookie(`${user.id}`);
      req.cookies[`${user.id}`] = "";
      const newToken = jsonWebToken.sign(
        { id: user.id },
        process.env.WEB_TOKEN_SECRET,
        {
          expiresIn: "35s",
        }
      );

      console.log("ok retoken", newToken);

      res.cookie(String(user.id), newToken, {
        path: "/",
        expires: new Date(Date.now() + 1000 * 30),
        httpOnly: true,
        sameSite: "lax",
      });
      req.id = user.id;
      next();
    }
  );
};

const logout = (req, res, next) => {
  const cookie = req.headers.cookie;
  const oldToken = cookie.split("=")[1]; //previous token

  if (!oldToken) {
    return res.status(400).json({ message: "Something Went Wrong" });
  }
  jsonWebToken.verify(
    String(oldToken),
    process.env.WEB_TOKEN_SECRET,
    (error, user) => {
      if (error) {
        console.log(error);
        return res.status(403).json({ message: "Authentication Failed" });
      }

      res.clearCookie(`${user.id}`);
      req.cookies[`${user.id}`] = "";
      return res.status(200).json({ message: "Logged Out " });
    }
  );
};

module.exports = {
  signUp,
  userVerification,
  login,
  getUser,
  refreshToken,
  logout,
};