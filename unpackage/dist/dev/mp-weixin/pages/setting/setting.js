"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "setting",
  setup(__props) {
    const genderOptions = common_vendor.ref(["男", "女"]);
    const genderIndex = common_vendor.ref(0);
    const campusOptions = common_vendor.ref(["韶乐园校区", "黄田坝校区", "十里亭校区"]);
    const campusIndex = common_vendor.ref(0);
    const dormitoryOptions = common_vendor.ref([
      "紫竹苑",
      "紫薇苑",
      "紫荆苑",
      "银杏苑",
      "丹竹苑",
      "红枫苑",
      "丹枫苑",
      "红棉苑",
      "碧桂苑",
      "芙蓉苑",
      "蔷薇苑",
      "秋枫苑",
      "海棠苑",
      "丁香苑",
      "樱花苑",
      "梧桐苑",
      "金竹苑",
      "景行苑",
      "文杏苑",
      "丹桂苑",
      "碧桃苑",
      "紫藤苑"
    ]);
    const dormitoryIndex = common_vendor.ref(0);
    const userInfo = common_vendor.ref({
      avatarUrl: "",
      nickName: "",
      studentIdNumber: "",
      campus: "",
      dormitory: "",
      major: ""
    });
    common_vendor.onMounted(() => {
      const storedUserId = common_vendor.index.getStorageSync("studentIdNumber");
      const storedNickname = common_vendor.index.getStorageSync("nickname");
      const storedAvatarUrl = common_vendor.index.getStorageSync("avatarUrl");
      const storedUser = common_vendor.index.getStorageSync("userInfo");
      userInfo.value = {
        // 登录时存储的核心字段
        studentIdNumber: storedUserId || storedUser.studentIdNumber || "",
        nickName: storedNickname || storedUser.nickName || "",
        avatarUrl: storedAvatarUrl || storedUser.avatarUrl || "",
        // 其他配置字段（从userInfo读取）
        gender: storedUser.gender || "",
        campus: storedUser.campus || "",
        dormitory: storedUser.dormitory || "",
        major: storedUser.major || ""
      };
      if (userInfo.value.gender) {
        const genderIdx = genderOptions.value.indexOf(userInfo.value.gender);
        if (genderIdx !== -1)
          genderIndex.value = genderIdx;
      }
      if (userInfo.value.campus) {
        const campusIdx = campusOptions.value.indexOf(userInfo.value.campus);
        if (campusIdx !== -1)
          campusIndex.value = campusIdx;
      }
      if (userInfo.value.dormitory) {
        const dormIdx = dormitoryOptions.value.indexOf(userInfo.value.dormitory);
        if (dormIdx !== -1)
          dormitoryIndex.value = dormIdx;
      }
    });
    const onGenderChange = (e) => {
      genderIndex.value = e.detail.value;
      userInfo.value.gender = genderOptions.value[genderIndex.value];
    };
    const onCampusChange = (e) => {
      campusIndex.value = e.detail.value;
      userInfo.value.campus = campusOptions.value[campusIndex.value];
    };
    const onDormitoryChange = (e) => {
      dormitoryIndex.value = e.detail.value;
      userInfo.value.dormitory = dormitoryOptions.value[dormitoryIndex.value];
    };
    const saveInfo = () => {
      common_vendor.index.setStorageSync("userInfo", userInfo.value);
      if (userInfo.value.studentIdNumber)
        common_vendor.index.setStorageSync("studentIdNumber", userInfo.value.studentIdNumber);
      if (userInfo.value.nickName)
        common_vendor.index.setStorageSync("nickname", userInfo.value.nickName);
      if (userInfo.value.avatarUrl)
        common_vendor.index.setStorageSync("avatarUrl", userInfo.value.avatarUrl);
      common_vendor.index.showToast({
        title: "信息保存成功",
        icon: "success"
      });
    };
    const logout = () => {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.clearStorageSync();
            common_vendor.index.reLaunch({
              url: "/pages/setting/setting"
              // 假设当前页面路径为 /pages/personal/personal
            });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return {
        a: userInfo.value.avatarUrl || "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg",
        b: common_vendor.o((...args) => _ctx.chooseAvatar && _ctx.chooseAvatar(...args)),
        c: common_vendor.t(userInfo.value.nickName || "未设置昵称"),
        d: common_vendor.t(userInfo.value.studentIdNumber || "请完成学生认证"),
        e: common_vendor.t(genderOptions.value[genderIndex.value] || "请选择"),
        f: genderOptions.value,
        g: genderIndex.value,
        h: common_vendor.o(onGenderChange),
        i: common_vendor.t(campusOptions.value[campusIndex.value] || "请选择"),
        j: campusOptions.value,
        k: campusIndex.value,
        l: common_vendor.o(onCampusChange),
        m: common_vendor.t(dormitoryOptions.value[dormitoryIndex.value] || "请选择"),
        n: dormitoryOptions.value,
        o: dormitoryIndex.value,
        p: common_vendor.o(onDormitoryChange),
        q: userInfo.value.major,
        r: common_vendor.o(($event) => userInfo.value.major = $event.detail.value),
        s: common_vendor.o(saveInfo),
        t: common_vendor.o(logout)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-018cdf56"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/setting/setting.js.map
