'use strict';
const axios = require('axios')
const dayjs = require('dayjs')
const data = require('./data.js')


const WX_OPENID = "";

const MEMBERID = "";

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

function getFormData() {
	let currentDate = dayjs().format("YYYY-MM-DD");
	// let currentDate = "2022-01-20";
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

async function start() {
	const [is_feedback, _id] = await checkHasDaka(WX_OPENID, MEMBERID);
	if (!is_feedback) {
		let data = getFormData();
		await daKa(data, WX_OPENID);
		console.log("打卡成功")
	}
}

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)

	await start()

	//返回数据给客户端
	return {
		"msg": "正常运行",
		"code": 200
	}
};

