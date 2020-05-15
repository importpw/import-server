module.exports = (req, res) => {
  res.send({
    versions: process.versions
  });
};
