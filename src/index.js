'use strict';
const axios = require('axios')
const dayjs = require('dayjs')
const data = require('./data.js')
const users = require('./test.js')

/**
 * 获取当前用户信息
 * @returns 当前用户信息
 */
function getUserClassInfo(openId) {
	axios({
		url: "https://a.welife001.com/getUser",
		method: "GET",
		headers: {
			imprint: openId,
		},
		data: {
			openId: openId,
		},
	});
}

/**
 * 返回当前用户是否需要签到
 *
 * @returns [是否需要签到，打卡项ID]
 */
async function checkHasDaka(openId, memberId) {
	try {
		const {
			data
		} = await axios({
			url: "https://a.welife001.com/info/getParent",
			method: "GET",
			headers: {
				imprint: openId,
			},
			params: {
				type: "-1",
				members: memberId,
				page: 0,
				size: 10,
				date: -1,
				hasMore: true,
			},
		});
		return [!data.data[0].is_feedback, data.data[0]._id];
	} catch (e) {
		return null;
	}
}

/**
 * 构建打卡表单
 */
function getFormData(MEMBERID) {
	let currentDate = dayjs().format("YYYY-MM-DD");
	data.daka_day = currentDate;
	data.invest.dat = currentDate;
	data.invest.time = new Date().getTime();
	data.member_id = MEMBERID;
	return data;
}

/**
 * 打卡
 */
function daKa(data, openId) {
	return axios({
		url: "https://a.welife001.com/applet/notify/feedbackWithOss",
		method: "POST",
		data,
		headers: {
			imprint: openId,
		},
	});
}

async function start(WX_OPENID, MEMBERID) {
	const [is_feedback, _id] = await checkHasDaka(WX_OPENID, MEMBERID);
	if (is_feedback) {
		let data = getFormData(MEMBERID);
		await daKa(data, WX_OPENID);
	}
}

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	for (let item of Object.keys(users)) {
		await start(users[item].openid, users[item].member_id)
		console.log(`${users[item].name}打卡成功`)
	}

	//返回数据给客户端
	return {
		"msg": "正常运行",
		"code": 200
	}
};
