"use strict";
const common_vendor = require("../../common/vendor.js");
const hooks_useStorage = require("../../hooks/useStorage.js");
const utils_uniHelper = require("../../utils/uniHelper.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "student",
  setup(__props) {
    const { getStorage } = hooks_useStorage.useStorage();
    const collegeOptions = common_vendor.ref([
      "请选择学院",
      "文学与传媒学院",
      "外国语学院",
      "旅游与地理学院",
      "生物与农业学院",
      "数学与统计学院",
      "智能工程学院",
      "化学与土木工程学院",
      "教育科学学院",
      "信息工程学院",
      "商学院",
      "政法学院",
      "音乐与舞蹈学院",
      "美术与设计学院",
      "体育学院",
      "医学院",
      "食品学院",
      "马克思主义学院"
    ]);
    const collegeIndex = common_vendor.ref(0);
    const isSubmitting = common_vendor.ref(false);
    const studentInfo = common_vendor.ref({
      university: "",
      // 学校
      college: "",
      // 所属学院
      major: "",
      // 专业
      studentIdNumber: "",
      // 学号
      idCardUrl: ""
      // 学生证照片临时路径
      // idCardServerUrl: ''  // 服务器返回的图片永久URL（用于提交）
    });
    const handleCollegeChange = (e) => {
      collegeIndex.value = e.detail.value;
      if (collegeIndex.value > 0) {
        studentInfo.value.college = collegeOptions.value[collegeIndex.value];
      } else {
        studentInfo.value.college = "";
      }
    };
    const handleUniversityInput = (e) => {
      studentInfo.value.university = e.detail.value.trim();
    };
    const handleMajorInput = (e) => {
      studentInfo.value.major = e.detail.value.trim();
    };
    const handleStudentIdInput = (e) => {
      studentInfo.value.studentIdNumber = e.detail.value.trim();
    };
    const chooseStudentCard = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          studentInfo.value.idCardUrl = res.tempFilePaths[0];
          common_vendor.index.showToast({
            title: "图片选择成功",
            icon: "success",
            duration: 1500
          });
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "图片选择失败，请重试",
            icon: "none",
            duration: 1500
          });
        }
      });
    };
    common_vendor.onMounted(() => {
      utils_uniHelper.ensureLoggedIn({ content: "请先登录再进行学生认证", redirectTo: "/pages/mine/mine" });
    });
    const submitAuth = async () => {
      if (isSubmitting.value)
        return;
      try {
        isSubmitting.value = true;
        if (!isFormValid.value) {
          common_vendor.index.showToast({ title: "请完善所有必填信息", icon: "none" });
          isSubmitting.value = false;
          return;
        }
        const userId = getStorage("userId");
        const token = getStorage("token");
        const uploadTask = common_vendor.index.uploadFile({
          url: "https://api.shaolezhuan.cn/student-verifications/submit",
          // 后端认证接口地址
          filePath: studentInfo.value.idCardUrl,
          // 本地临时文件路径
          name: "cardPhoto",
          // 与后端参数名一致（formData 中的文件字段）
          formData: {
            university: studentInfo.value.university,
            college: studentInfo.value.college,
            major: studentInfo.value.major,
            studentIdNumber: studentInfo.value.studentIdNumber,
            userId
            // 若后端需要用户ID，需传入
          },
          header: {
            "Authorization": token ? `Bearer ${token}` : ""
            // 携带Token（若需要）
          },
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/student/student.vue:251", "认证提交响应：", res);
            let data;
            try {
              data = JSON.parse(res.data);
            } catch (e) {
              common_vendor.index.showToast({ title: "服务器响应格式错误", icon: "none" });
              return;
            }
            if (data.code === 200) {
              common_vendor.index.showToast({
                title: "认证提交成功，等待审核",
                icon: "success",
                duration: 2e3
              });
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 2e3);
            } else {
              common_vendor.index.showToast({
                title: data.msg || "认证提交失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/student/student.vue:276", "认证提交失败：", err);
            common_vendor.index.showToast({
              title: "提交失败，请重试",
              icon: "none"
            });
          },
          complete: () => {
            isSubmitting.value = false;
          }
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/student/student.vue:288", "认证提交异常：", err);
        common_vendor.index.showToast({
          title: "提交异常，请稍后重试",
          icon: "none"
        });
        isSubmitting.value = false;
      }
    };
    const isFormValid = common_vendor.computed(() => {
      return !!studentInfo.value.university && !!studentInfo.value.college && !!studentInfo.value.major && !!studentInfo.value.studentIdNumber && !!studentInfo.value.idCardUrl;
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o([($event) => studentInfo.value.university = $event.detail.value, handleUniversityInput]),
        b: studentInfo.value.university,
        c: common_vendor.t(collegeOptions.value[collegeIndex.value] || "请选择学院"),
        d: collegeOptions.value,
        e: collegeIndex.value,
        f: common_vendor.o(handleCollegeChange),
        g: common_vendor.o([($event) => studentInfo.value.major = $event.detail.value, handleMajorInput]),
        h: studentInfo.value.major,
        i: common_vendor.o([($event) => studentInfo.value.studentIdNumber = $event.detail.value, handleStudentIdInput]),
        j: studentInfo.value.studentIdNumber,
        k: studentInfo.value.idCardUrl,
        l: !studentInfo.value.idCardUrl
      }, !studentInfo.value.idCardUrl ? {
        m: common_vendor.p({
          type: "plus",
          size: "36",
          color: "#666"
        })
      } : {}, {
        n: studentInfo.value.idCardUrl
      }, studentInfo.value.idCardUrl ? {
        o: common_vendor.p({
          type: "success",
          size: "20",
          color: "#fff"
        })
      } : {}, {
        p: common_vendor.o(chooseStudentCard),
        q: isSubmitting.value
      }, isSubmitting.value ? {
        r: common_vendor.p({
          type: "loading",
          size: "24",
          color: "#fff"
        })
      } : {}, {
        s: isSubmitting.value
      }, isSubmitting.value ? {} : {}, {
        t: common_vendor.o(submitAuth),
        v: !isFormValid.value || isSubmitting.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-809c9d48"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/student/student.js.map
