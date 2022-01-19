import axios from "axios";
import data from "./data.js";
import dayjs from "dayjs";

const WX_OPENID = "oWRkU0QMZ-Z6DueK_2afvrjl3d0g";

const MEMBERID = "61e81461800b28070794d672";

/**
 * 获取当前用户信息
 * @returns 当前用户信息
 */
function getUserClassInfo() {
  axios({
    url: "https://a.welife001.com/getUser",
    method: "GET",
    headers: {
      imprint: "oWRkU0QMZ-Z6DueK_2afvrjl3d0g",
    },
    data: {
      openId: "oWRkU0QMZ-Z6DueK_2afvrjl3d0g",
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
    const { data } = await axios({
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
function daKa(data) {
  return axios({
    url: "https://a.welife001.com/applet/notify/feedbackWithOss",
    method: "POST",
    data,
    headers: {
      imprint: "oWRkU0QMZ-Z6DueK_2afvrjl3d0g",
    },
  });
}

async function main() {
  const [is_feedback, _id] = await checkHasDaka(WX_OPENID, MEMBERID);
  if (is_feedback) {
    let data = getFormData();
    const res = await daKa(data);
  }
}

main();
