/**
 *
 */
$(function () {
    var shopId = getQueryString("shopId");
    var sEdit = !!shopId;
    var initUrl = '/shopadmin/getshopinitinfo';
    var registerShopUrl = '/shopadmin/registershop';
    var shopInfoUrl = '/shopadmin/getshopbyid?shopId=' + shopId;
    var shopEditUrl = '/shopadmin/modifyshop';

    if (sEdit) {
        getShopInfo(shopId);
    } else {
        getShopInitInfo();
    }

    function getShopInitInfo() {
        $.getJSON(initUrl, function (data) {
            if (data.success) {
                var tempHtml = '';
                var tempAreaHtml = '';
                data.shopCategoryList.map(function (item, index) {
                    tempHtml += '<option data-id="'
                        + item.shopCategoryId + '">' + item.shopCategoryName + '</option>';
                });
                data.areaList.map(function (item, index) {
                    tempAreaHtml += '<option data-id="'
                        + item.areaId + '">' + item.areaName + '</option>';
                });
                $('#shop-category').html(tempHtml);
                $('#area').html(tempAreaHtml);
            }
        });
    }

    function getShopInfo(shopId) {
        $.getJSON(shopInfoUrl, function (data) {
            if (data.success) {
                var shop = data.shop;
                $('#shop_name').val(shop.shopName);
                $('#shop_addr').val(shop.shopAddr);
                $('#shop_phone').val(shop.phone);
                $('#shop_desc').val(shop.shopDesc);
                // 给店铺类别选定原先的店铺类别值
                var shopCategory = '<option data-id="'
                    + shop.shopCategory.shopCategoryId + '" selected>'
                    + shop.shopCategory.shopCategoryName + '</option>';
                var tempAreaHtml = '';
                // 初始化区域列表
                data.areaList.map(function (item, index) {
                    tempAreaHtml += '<option data-id="' + item.areaId + '">'
                        + item.areaName + '</option>';
                });
                $('#shop-category').html(shopCategory);
                // 不允许选择店铺类别
                $('#shop-category').attr('disabled', 'disabled');
                $('#area').html(tempAreaHtml);
                // 给店铺选定原先的所属的区域
                $("#area option[data-id='" + shop.area.areaId + "']").attr(
                    "selected", "selected");
            }
        });
    }

    $('#submit').click(function () {
        var shop = {};
        if (sEdit) {
            // 若属于编辑，则给shopId赋值
            shop.shopId = shopId;
        }
        shop.shopName = $('#shop_name').val();
        shop.shopAddr = $('#shop_addr').val();
        shop.phone = $('#shop_phone').val();
        shop.shopDesc = $('#shop_desc').val();
        shop.shopCategory = {
            shopCategoryId: $('#shop-category').find('option').not(function () {
                return !this.selected;
            }).data('id')
        };
        shop.area = {
            areaId: $('#area').find('option').not(function () {
                return !this.selected;
            }).data('id')
        };
        var shopImg = $('#shop_img')[0].files[0];
        var formData = new FormData();
        formData.append('shopImg', shopImg);
        formData.append('shopStr', JSON.stringify(shop));
        var verifyCodeActual = $("#j_captcha").val();
        if (!verifyCodeActual) {
            $.toast("请输入验证码");
            return;
        }
        formData.append("verifyCodeActual", verifyCodeActual);
        $.ajax({
            url: (sEdit ? shopEditUrl : registerShopUrl),
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            cache: false,
            success: function (data) {
                if (data.success) {
                    $.toast('提交成功');
                    if (!sEdit) {
                        // 若为注册操作，成功后返回店铺列表页
                        window.location.href = "/shopadmin/shoplist";
                    }
                } else {
                    $.toast('提交失败');
                }
                $("#captcha_img").click();
            }
        });
    });
})