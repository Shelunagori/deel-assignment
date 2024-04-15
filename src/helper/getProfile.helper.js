const { Profile } = require('../model/index');

const getProfileById = async (profileId) => {
    return await Profile.findOne({ where: { id: parseInt(profileId) } });
}

module.exports = {getProfileById}