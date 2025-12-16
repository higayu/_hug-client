
//グローバル宣言
var GlobalR_id = 0;
var GlobalAbsence = "";
var jsAttendTimeChanged = false;
let globalSendLeaveMailDataList = {};

// ボタン押下のフラグを準備
let is_button_clicked = false;

//pageを取得しておく
var page_name = "";
//現在のページを取得する
page_name = window.location.href.split('/').pop();
page_name = page_name.substring(0, page_name.indexOf("."));

let IS_HOLIDAY;
document.addEventListener('DOMContentLoaded', function () {
    const select_date = $('[name=date]').val();
    IS_HOLIDAY = isWeekend(select_date);
});

/** attend_flg 1:出席 2:欠席(加算取る) 3:欠席(加算取らない) 4:退室 **/
$(document).ready(function () {
    // 送迎関連項目の表示を制御
    changePickupDisabled();

    var mode_check = $('[name=mode]').val();
    var hoiku_start_hour_check = $('[name=hoiku_start_hour]').val();

    // 保育所等訪問支援　かつ　初回の時
    if (mode_check == "hoiku_regist" && (!hoiku_start_hour_check)) {

        var hoikuspecialadd = $('[name=hoiku_start_hour]').data("hoikuspecialadd");

        // 訪問支援特別加算連動にチェックが入っている場合
        if (hoikuspecialadd == "1") {
            $('[name=houmon_special_add]').prop("checked", true);
        }

    }

    //色付け用クラス付与
    var js_first_tr = '#releasetable > .js_first_tr';
    var js_second_tr = '#releasetable > .js_second_tr';

    //一度クラス除去
    $(js_first_tr).removeClass("even").removeClass("odd");
    $(js_second_tr).removeClass("even").removeClass("odd");

    //児童ごとにtrが二つあるためそれぞれに色を付与
    $(js_first_tr).each(function (i, elm) {
        let remainder = i % 2;
        if (remainder == 0) {
            //偶数の時はodd
            $(elm).addClass("odd");
        } else {
            //奇数の時はeven
            $(elm).addClass("even");
        }
    });
    $(js_second_tr).each(function (i, elm) {
        let remainder = i % 2;
        if (remainder == 0) {
            //偶数の時はodd
            $(elm).addClass("odd");
        } else {
            //奇数の時はeven
            $(elm).addClass("even");
        }
    });

    //印刷画面で放デイのチェックがなかった場合欠席時対応加算Ⅱは隠す
    if ($('[name=s_ary\\[1\\]]').prop('checked') == false) {
        $('[name=absence_type\\[3\\]]').closest('label').hide();
        $('[name=absence_type\\[4\\]]').closest('label').hide();

        //文言を変える
        $('#js_check_absence_option_1').html('欠席時対応加算');
        $('#js_check_absence_option_2').html('欠席時対応加算【加算なし】');
    }

    let providing_type = parseInt($("input[name='providing_type']:checked").val());

    // 提供形態に合わせて算定区分ラジオボタンの有効/無効を切り替える
    toggleTimeDivisionRadioButton(providing_type);
});


$(function () {
    $(document).on("change", ".js_place_text", (function () {
        // 送迎関連項目の表示を制御
        changePickupDisabled();
    }));
});


$(function () {
    $(document).on("change", "[name=s_ary\\[1\\]]", (function () {
        //印刷画面で放デイのチェックがなかった場合欠席時対応加算Ⅱは隠す
        if ($('[name=s_ary\\[1\\]]').prop('checked') == false) {
            $('[name=absence_type\\[3\\]]').prop('checked', false);
            $('[name=absence_type\\[3\\]]').closest('label').hide();

            $('[name=absence_type\\[4\\]]').prop('checked', false);
            $('[name=absence_type\\[4\\]]').closest('label').hide();

            //文言を変える
            $('#js_check_absence_option_1').html('欠席時対応加算');
            $('#js_check_absence_option_2').html('欠席時対応加算【加算なし】');
        } else {
            $('[name=absence_type\\[3\\]]').closest('label').show();
            $('[name=absence_type\\[4\\]]').closest('label').show();

            //文言を変える
            $('#js_check_absence_option_1').html('欠席時対応加算(Ⅰ)');
            $('#js_check_absence_option_2').html('欠席時対応加算(Ⅰ)【加算なし】');
        }
    }));
});


$(function () {
    // デザイン用JS
    var w = $(window).width();
    if (w <= 480) {
        size = 300;
    } else {
        size = 600;
    }

    $('#addtend_dialog_mail').dialog({
        autoOpen: false, // 自動でオープンしない
        width: size, // 横幅のサイズを設定
        modal: true, // モーダル表示する
        resizable: false, // リサイズしない
        draggable: false, // ドラッグしない
        hide: "fade", // 非表示時のエフェクト
        closeOnEscape: false,
        open: function (event, ui) {
            //$(".ui-dialog-titlebar-close", $(this).parent()).hide();
        }
    });

    $('#exit_button').dialog({
        autoOpen: false, // 自動でオープンしない
        width: 'auto', // 横幅のサイズを設定
        modal: true, // モーダル表示する
        resizable: false, // リサイズしない
        draggable: false, // ドラッグしない
        hide: "fade", // 非表示時のエフェクト
    });

    $('#use_plantime').dialog({
        autoOpen: false, // 自動でオープンしない
        width: 'auto', // 横幅のサイズを設定
        modal: true, // モーダル表示する
        resizable: false, // リサイズしない
        draggable: false, // ドラッグしない
        hide: "fade", // 非表示時のエフェクト

        open: function(event, ui) {
            // モーダルが開かれるたびに、ダイアログのボタン押下フラグをリセット
            is_button_clicked = false;
        },

        close: function(event, ui) {

            // ボタンが押されずにモーダルが閉じられた場合、延長支援加算登録処理を実行する
            if (!is_button_clicked) {

                let dialog_data = $('#use_plantime').data();
                let r_id = dialog_data.r_id;
                let c_id = dialog_data.c_id;
                let f_id = dialog_data.f_id;
                let date = dialog_data.select_date;
                let type = dialog_data.providing_type;

                // 延長支援加算の連動処理
                const enter_time_hi = dialog_data.enter_time_hi || '';
                const leave_time_hi = dialog_data.leave_time_hi || '';

                // 延長支援時間を取得して、延長支援時間情報とモーダルを出すか出さないかを返す処理
                getDetailExtensionData(c_id, f_id, r_id, date, enter_time_hi, leave_time_hi, type, 'detail', false, function (response) {
                    if (response.modal_type !== null) {
                        // モーダルを表示
                        showExtensionModal(f_id, response.data, response.form_ary, true, 'detail');
                    } else {
                        // モーダルを出さない場合はDOM要素に延長支援時間情報を挿入
                        $(`#extension_support_save_${r_id}`).attr({'data-r_id': response.form_ary[0],});

                        // 延長支援時間をセット（時間1の開始時間と終了時間、時間2の開始時間と終了時間）
                        for (let i = 1; i <= 8; i++) {
                            $(`#extension_support_save_${r_id}`).attr(`data-exTime${i}`, response.data ? response.data[i] : '');
                        }

                        let form_ary = [];
                        form_ary.push(r_id);
                        form_ary.push($(".children" + r_id).find(".realname").data("use_services"));

                        let extensionSupportElement = $(`#extension_support_save_${r_id}`).data('r_id');
                        if (extensionSupportElement) {
                            for (let i = 1; i <= 8; i++) {
                                let ex_time = $(`#extension_support_save_${r_id}`).attr(`data-extime${i}`);
                                form_ary.push(ex_time !== null && ex_time !== undefined ? ex_time : '');
                            }
                            setRelatedExtensionDetail(date, c_id, f_id, form_ary);
                        }
                    }
                });
            }
        }
    });

    //利用時間があれば
    if ($('.js_law2024').val()) {
        var colspan = 5;
    } else {
        var colspan = 4;
    }

    $('#addtend_dialog02').dialog({
        autoOpen: false, // 自動でオープンしない
        width: size, // 横幅のサイズを設定
        modal: true, // モーダル表示する
        resizable: false, // リサイズしない
        draggable: false, // ドラッグしない
        hide: "fade", // 非表示時のエフェクト
        buttons: [ // ボタン名 : 処理 を設定
            {
                text: '欠席時対応加算Ⅱを算定する',
                click: function () {

                    var absence_two_note = $("[name=absence_two_note]").val();
                    //欠席時対応加算の記録者を取得する
                    var absence_two_note_staff = $("[name=dialog_absence_two_note_staff]").val();
                    var all_edit_flg = $("#js_all_edit_flg").length;

                    //一括編集画面の場合
                    if (all_edit_flg === 1) {
                        $('[name="list[' + GlobalR_id + '][absence_two_note]"]').val(absence_two_note);
                        $('[name="list[' + GlobalR_id + '][absence_two_note_staff]"]').val(absence_two_note_staff);
                        $('[name="list[' + GlobalR_id + '][absence_two_flg]"]').val(1);

                        var absence_on_html = '<a href="#" class="enter red js_absence-two-on js_attend_absence_two dib mt10"><b>欠席時対応加算Ⅱ</b></a>';
                        var absence_reason_edit = '<td colspan="'+colspan+'" class="tal"><div class="js_reason_div"><b>[記録者]</b>&nbsp; <span class="dib"><select class="mr10 comboBoxStaffJquery" id="js_combo' + GlobalR_id + '"></select>&nbsp;<select class="js_reason_staff" id="js_staff' + GlobalR_id + '" data-absence="2"></select></span><textarea name="list[' + GlobalR_id + '][reason_text]" id=' + GlobalR_id + ' rows="2" class="form-control mt5 js_reason_text db js_ar_edit_two minH14em" data-absence="2" placeholder="理由記入欄"></textarea></div></td>';
                        $("#providing" + GlobalR_id).html(absence_on_html);
                        if ($('.js_children_area' + GlobalR_id).next('tr').data('rid') == GlobalR_id) {
                            $('.js_children_area' + GlobalR_id).find('.enter').attr('rowspan', 1);
                            $('.js_children_area' + GlobalR_id).find('.leave').attr('rowspan', 1);
                            $('.js_children_area' + GlobalR_id).find('.body_temp').attr('rowspan', 1);
                            $('.js_children_area' + GlobalR_id).find('.time_division').attr('rowspan', 1);
                            $('.js_children_area' + GlobalR_id).find('.providing').attr('rowspan', 1);
                            $('.js_tr_area' + GlobalR_id).prepend(absence_reason_edit)
                            $('[name="list[' + GlobalR_id + '][reason_text]"]').val(absence_two_note);
                        }

                        //スマホ表示の時にもう一つのtableの欠席時対応加算Ⅱは非表示にする
                        // if (window.innerWidth <= 768) {
                        //     $('.pinned').find('.tal').hide();
                        // }

                        //スタッフのプルダウン取得
                        let combo_copy = $('.comboBoxStaffJquery:first').clone();
                        let staff_copy = $('#js_setting_absence_note_staff').clone();
                        $(combo_copy).children('option').each(function (i, combo) {
                            $('#js_combo' + GlobalR_id).append(combo);
                        });

                        $($(staff_copy).children('option')).each(function (i, staff) {
                            $('#js_staff' + GlobalR_id).append(staff);
                        });
                        $('#js_combo' + GlobalR_id).val(0);
                        $('#js_staff' + GlobalR_id).val(absence_two_note_staff);
                        getCancelCount();

                        // 加算実績テーブルの出欠席更新
                        $(`#js_adding_atndinfo${GlobalR_id}`).html('<b class="red">欠席時対応加算Ⅱ</b>');

                        //連動分の加算を削除
                        DeleteAddingRows(GlobalR_id)

                    } else {

                        var r_id = $("#hidden_r_id").text();
                        var c_id = $("#hidden_c_id").text();
                        var f_id = $("#hidden_f_id").text();
                        var date = $("#hidden_date").text();

                        proViding(r_id, 3, c_id, f_id, date, absence_two_note, absence_two_note_staff);
                    }
                    setAttendHeight();
                    $(this).dialog("close");

                    // 加算実績テーブルの加算エラーチェック処理（欠席時対応加算Ⅱを算定した場合のみ）
                    let $attend = $(`#js_related_class${GlobalR_id}`);
                    let $target = $attend.find('tr:first');
                    // 欠席時対応加算エラーチェック
                    checkHomeAddingError(".js-selected-adding-all", $target);
                }
            },
            {
                text: '欠席時対応加算Ⅱを算定しない',
                click: function () {
                    //欠席時対応加算の備考を取得する
                    var absence_two_note = $("[name=absence_two_note]").val();
                    //欠席時対応加算の記録者を取得する
                    var absence_two_note_staff = $("[name=dialog_absence_two_note_staff]").val();
                    var all_edit_flg = $("#js_all_edit_flg").length;

                    //一括編集画面の場合
                    if (all_edit_flg === 1) {
                        $('[name="list[' + GlobalR_id + '][absence_two_note]"]').val(absence_two_note);
                        $('[name="list[' + GlobalR_id + '][absence_two_note_staff]"]').val(absence_two_note_staff);
                        $('[name="list[' + GlobalR_id + '][absence_two_flg]"]').val(2);
                        var absence_on_html = '<a href="#" class="enter red js_absence-two-off js_attend_absence_two dib mt10"><b>欠席時対応加算Ⅱを算定しない</b></a>';
                        var absence_reason_edit = '<td colspan="'+colspan+'" class="tal"><div class="js_reason_div"><b>[記録者]</b>&nbsp; <span class="dib"><select class="mr10 comboBoxStaffJquery" id="js_combo' + GlobalR_id + '"></select>&nbsp;<select class="js_reason_staff" id="js_staff' + GlobalR_id + '" data-absence="2"></select></span><textarea name="list[' + GlobalR_id + '][reason_text]" id=' + GlobalR_id + ' rows="2" class="form-control mt5 js_reason_text db js_ar_edit_two minH14em" data-absence="2" placeholder="理由記入欄"></textarea></div></td>';

                        $("#providing" + GlobalR_id).html(absence_on_html);
                        if ($('.js_children_area' + GlobalR_id).next('tr').data('rid') == GlobalR_id) {
                            $('.js_children_area' + GlobalR_id).find('.enter').attr('rowspan', 1);
                            $('.js_children_area' + GlobalR_id).find('.leave').attr('rowspan', 1);
                            $('.js_children_area' + GlobalR_id).find('.body_temp').attr('rowspan', 1);
                            $('.js_children_area' + GlobalR_id).find('.providing').attr('rowspan', 1);
                            $('.js_children_area' + GlobalR_id).find('.time_division').attr('rowspan', 1);
                            $('.js_tr_area' + GlobalR_id).prepend(absence_reason_edit)
                            $('[name="list[' + GlobalR_id + '][reason_text]"]').val(absence_two_note);
                        }

                        //スマホ表示の時にもう一つのtableの欠席時対応加算Ⅱは非表示にする
                        // if (window.innerWidth <= 768) {
                        //     $('.pinned').find('.tal').hide();
                        // }

                        //スタッフのプルダウン取得
                        let combo_copy = $('.comboBoxStaffJquery:first').clone();
                        let staff_copy = $('#js_setting_absence_note_staff').clone();
                        $(combo_copy).children('option').each(function (i, combo) {
                            $('#js_combo' + GlobalR_id).append(combo);
                        });

                        $($(staff_copy).children('option')).each(function (i, staff) {
                            $('#js_staff' + GlobalR_id).append(staff);
                        });
                        $('#js_combo' + GlobalR_id).val(0);
                        $('#js_staff' + GlobalR_id).val(absence_two_note_staff);

                        getCancelCount();

                        // 加算実績テーブルの出欠席更新
                        $(`#js_adding_atndinfo${GlobalR_id}`).html('<b class="red">欠席時対応加算Ⅱを算定しない</b>');

                        //連動分の加算を削除
                        DeleteAddingRows(GlobalR_id)

                    } else {
                        var r_id = $("#hidden_r_id").text();
                        var c_id = $("#hidden_c_id").text();
                        var f_id = $("#hidden_f_id").text();
                        var date = $("#hidden_date").text();

                        proViding(r_id, 4, c_id, f_id, date, absence_two_note, absence_two_note_staff);
                    }
                    setAttendHeight();
                    $(this).dialog("close");
                }
            }
        ]
    });

    // ajax用PHP
    var url = "./ajax/ajax_attendance.php";
    var is_mail = 0;
    var mail_flg = 0;
    var linkage = 0;
    var idname = "";
    var atnd_data = "";
    var r_id = "";
    var c_id = "";
    var f_id = "";
    var size = "";
    var date = "";
    var strength_action = "";
    var data_list = {};
    // 画面サイズ取得
    var w = $(window).width();
    if (w <= 480) {
        size = 300;
    } else {
        size = 600;
    }

    $('#addtend_dialog').dialog({
        autoOpen: false, // 自動でオープンしない
        width: size, // 横幅のサイズを設定
        modal: true, // モーダル表示する

        resizable: false, // リサイズしない
        draggable: false, // ドラッグしない
        // show: "clip",     // 表示時のエフェクト
        hide: "fade", // 非表示時のエフェクト
        buttons: [
            //　モーダル初期設定
            {
                text: '欠席時対応加算を算定する',
                click: function () {

                    //欠席時対応加算の備考を取得する
                    var absence_note = $("[name=absence_note]").val();
                    //欠席時対応加算の記録者を取得する
                    var absence_note_staff = $("[name=dialog_absence_note_staff]").val();
                    var all_edit_flg = $("#js_all_edit_flg").length;

                    //一括編集画面の場合
                    if (all_edit_flg === 1) {

                        //欠席時対応加算を選択したフラグを立てる(デフォルト文差し込み判定に使用)
                        $('[name="list[' + GlobalR_id + '][absence_click_count]"]').val(1);
                        $('[name="list[' + GlobalR_id + '][absence_note]"]').val(absence_note);
                        $('[name="list[' + GlobalR_id + '][absence_note_staff]"]').val(absence_note_staff);

                        var month = getMonth();

                        var absence_times = parseInt($(GlobalAbsence).attr("abs_times")) + 1;
                        var hidden = '<input type="hidden" value="2" name="list[' + GlobalR_id + '][attend_flg]" abs_times="' + absence_times + '">';
                        var absence_on_html = '<a href="#" class="enter red absence-on js_attend_absenceflg2 dib m5"><b>欠席（' + month + '月欠席' + absence_times + '回）</b></a>';
                        var absence_reason_edit = '<div class="js_reason_div"><b>[記録者]</b>&nbsp; <span class="dib"><select class="mr10 comboBoxStaffJquery" id="js_combo' + GlobalR_id + '"></select>&nbsp;<select class="js_reason_staff" id="js_staff' + GlobalR_id + '" data-absence="2"></select></span><textarea name="list[' + GlobalR_id + '][reason_text]" id=' + GlobalR_id + ' rows="2" class="form-control mt5 js_reason_text db minH14em" data-absence="2" placeholder="理由記入欄"></textarea></div>';

                        $(GlobalAbsence).parent().html(hidden + absence_on_html + absence_reason_edit);
                        $('[name="list[' + GlobalR_id + '][reason_text]"]').val(absence_note);

                        //スタッフのプルダウン取得
                        let combo_copy = $('.comboBoxStaffJquery:first').clone();
                        let staff_copy = $('#js_setting_absence_note_staff').clone();
                        $(combo_copy).children('option').each(function (i, combo) {
                            $('#js_combo' + GlobalR_id).append(combo);
                        });

                        $($(staff_copy).children('option')).each(function (i, staff) {
                            $('#js_staff' + GlobalR_id).append(staff);
                        });
                        $('#js_combo' + GlobalR_id).val(0);
                        $('#js_staff' + GlobalR_id).val(absence_note_staff);

                        getCancelCount();

                        // 食事提供加算用の処理
                        let meal_offer_flg = $('[name="list[' + GlobalR_id + '][meal_offer_flg]"]').val();　// 食事提供加算の対象児童なのかを取得
                        let addingMealFlg = $('[name="list[' + GlobalR_id + '][adding_meal_flg]"]').val();　// 食事提供加算の連動機能有無を取得
                        let addingMealVal = $('[name="list[' + GlobalR_id + '][adding_meal_id]"]').val();　// 食事提供加算の値を取得

                        // 食事提供加算対象児童で、連動機能ある場合は「なし」を表示
                        if ((addingMealFlg === '1') && (meal_offer_flg === '1')) {
                            if (addingMealVal === '1') {
                                $("#meal" + GlobalR_id + " .meal_btn").trigger('click');
                            }
                            $("#meal" + GlobalR_id + " .meal_btn").hide();
                            $("#meal" + GlobalR_id + " b").show();
                        }

                        // 加算実績テーブルの出欠席更新
                        $(`#js_adding_atndinfo${GlobalR_id}`).html('<b class="red">欠席</b>');

                    } else {
                        data_list["r_id"] = atnd_data[1];
                        data_list["c_id"] = atnd_data[2];
                        data_list["f_id"] = atnd_data[3];
                        data_list["mail_flg"] = mail_flg;
                        data_list["attend_flg"] = 2;
                        data_list["linkage"] = linkage;
                        data_list["date"] = atnd_data[4];
                        data_list["strength_action"] = atnd_data[5];
                        data_list["special_support"] = atnd_data[6];
                        data_list["absence_note"] = absence_note;
                        data_list["absence_note_staff"] = absence_note_staff;

                        $.ajax({
                            url: url,
                            data: {
                                "data_list": data_list,
                            },
                            timeout: 3000,
                            async: false,
                            dataType: 'json',
                            success: function (data) {
                                Success(data, data_list["r_id"], 0, data_list["c_id"], data_list["f_id"], data_list["attend_flg"], 0, data_list["date"]);
                            }
                        });


                        //連動の調整
                        //要素をloadする
                        var rid = data_list["r_id"]
                        $.ajax({
                            type: 'GET',
                            url: 'attendance.php?mode=detail&date=' + data_list["date"],
                            dataType: 'html',
                            success: function (data) {
                                $('#js_adding_list' + rid, window.parent.document).html($(data).find('#js_adding_list' + rid).html());
                            }
                        });
                    }

                    setAttendHeight();
                    $(this).dialog("close");

                    // 加算実績テーブルの加算エラーチェック処理（欠席時対応加算を算定した場合のみ）
                    let $attend = $(`#js_related_class${GlobalR_id}`);
                    let $target = $attend.find('tr:first');
                    // 欠席時対応加算エラーチェック
                    checkHomeAddingError(".js-selected-adding-all", $target);

                }
            },
            {
                text: '欠席時対応加算を算定しない',
                click: function () {

                    //2022年9月リリース分にて理由を残せるように変更
                    //欠席時対応加算の備考を取得する
                    var absence_note = $("[name=absence_note]").val();
                    //欠席時対応加算の記録者を取得する
                    var absence_note_staff = $("[name=dialog_absence_note_staff]").val();
                    var all_edit_flg = $("#js_all_edit_flg").length;

                    //一括編集画面の場合
                    if (all_edit_flg === 1) {

                        //欠席時対応加算を選択したフラグを立てる(デフォルト文差し込み判定に使用)
                        $('[name="list[' + GlobalR_id + '][absence_click_count]"]').val(1);
                        $('[name="list[' + GlobalR_id + '][absence_note]"]').val(absence_note);
                        $('[name="list[' + GlobalR_id + '][absence_note_staff]"]').val(absence_note_staff);

                        var absence_times = parseInt($(GlobalAbsence).attr("abs_times"));
                        var hidden = '<input type="hidden" value="3" name="list[' + GlobalR_id + '][attend_flg]" abs_times="' + absence_times + '">';
                        var absence_on_html = '<a href="#" class="enter red absence-off js_attend_absenceflg3"><b>欠席（欠席時対応加算を取らない）</b></a>'
                        var absence_reason_edit = '<div class="js_reason_div"><b>[記録者]</b>&nbsp; <span class="dib"><select class="mr10 comboBoxStaffJquery" id="js_combo' + GlobalR_id + '"></select>&nbsp;<select class="js_reason_staff" id="js_staff' + GlobalR_id + '"></select></span><textarea name="list[' + GlobalR_id + '][reason_text]" id=' + GlobalR_id + ' rows="2" class="form-control mt5 js_reason_text db minH14em" data-absence="1" placeholder="理由記入欄"></textarea></div>';
                        $(GlobalAbsence).parent().html(hidden + absence_on_html + absence_reason_edit);
                        $('[name="list[' + GlobalR_id + '][reason_text]"]').val(absence_note);

                        //スタッフのプルダウン取得
                        let combo_copy = $('.comboBoxStaffJquery:first').clone();
                        let staff_copy = $('#js_setting_absence_note_staff').clone();
                        $(combo_copy).children('option').each(function (i, combo) {
                            $('#js_combo' + GlobalR_id).append(combo);
                        });

                        $($(staff_copy).children('option')).each(function (i, staff) {
                            $('#js_staff' + GlobalR_id).append(staff);
                        });
                        $('#js_combo' + GlobalR_id).val(0);
                        $('#js_staff' + GlobalR_id).val(absence_note_staff);

                        getCancelCount();

                        // 食事提供加算用の処理
                        let meal_offer_flg = $('[name="list[' + GlobalR_id + '][meal_offer_flg]"]').val();　// 食事提供加算の対象児童なのかを取得
                        let addingMealFlg = $('[name="list[' + GlobalR_id + '][adding_meal_flg]"]').val();　// 食事提供加算の連動機能有無を取得
                        let addingMealVal = $('[name="list[' + GlobalR_id + '][adding_meal_id]"]').val();　// 食事提供加算の値を取得

                        // 食事提供加算対象児童で、連動機能ある場合は「なし」を表示
                        if ((addingMealFlg === '1') && (meal_offer_flg === '1')) {
                            if (addingMealVal === '1') {
                                $("#meal" + GlobalR_id + " .meal_btn").trigger('click');
                            }
                            $("#meal" + GlobalR_id + " .meal_btn").hide();
                            $("#meal" + GlobalR_id + " b").show();
                        }

                        // 加算実績テーブルの出欠席更新
                        $(`#js_adding_atndinfo${GlobalR_id}`).html('<b class="red">欠席(欠席時対応加算を取らない)</b>');

                    } else {
                        data_list["r_id"] = atnd_data[1];
                        data_list["c_id"] = atnd_data[2];
                        data_list["f_id"] = atnd_data[3];
                        data_list["mail_flg"] = mail_flg;
                        data_list["attend_flg"] = 3;
                        data_list["linkage"] = linkage;
                        data_list["date"] = atnd_data[4];
                        data_list["strength_action"] = atnd_data[5];
                        data_list["absence_note"] = absence_note;
                        data_list["absence_note_staff"] = absence_note_staff;

                        $.ajax({
                            url: url,
                            data: {
                                "data_list": data_list,
                            },
                            timeout: 3000,
                            async: false,
                            dataType: 'json',
                            success: function (data) {
                                Success(data, data_list["r_id"], 0, data_list["c_id"], data_list["f_id"], data_list["attend_flg"], 0, data_list["date"]);
                            }
                        });
                    }
                    setAttendHeight();
                    $(this).dialog("close");
                }
            }
        ]

    });

    // .jqeryui-absence クリック時にモーダル表示
    $(document).on('click', '.jqeryui-absence', function () {
        // 予約IDなど用意
        idname = $(this).attr("id");
        atnd_data = idname.split("_");

        //非表示にしてプルダウンが開かないようにする
        $('#addtend_dialog').find('.comboBoxStaffJquery').hide();
        $('#js_absence_note_staff').hide();
        $('#js_absence_note_dialog').hide();

        //再表示
        $('#addtend_dialog').find('.comboBoxStaffJquery').show();
        $('#js_absence_note_staff').show();
        $('#js_absence_note_dialog').show();

        //ダイアログ表示
        $('#addtend_dialog').dialog('open');

        //欠席回数
        c_id = atnd_data[2];
        f_id = atnd_data[3];
        setAbsenceTimes(c_id, f_id);
        return false;
    });

    // モーダル画面以外のブラウザ領域をクリックで、モーダル非表示
    $(document).on('click', '.ui-widget-overlay', function () {
        //非表示にしてプルダウンが開かないようにする
        $('#addtend_dialog').find('.comboBoxStaffJquery').hide();
        $('#js_absence_note_staff').hide();
        $('#js_absence_note_dialog').hide();

        $('#addtend_dialog02').find('.comboBoxStaffJquery').hide();
        $('#js_absence_two_note_staff').hide();
        $('#js_absence_two_note_dialog').hide();

        $('.js_dialog_time').hide();

        //ダイアログを閉じる
        $('.ui-dialog-content').dialog('close');

    });
});


/**
 * ふりがなから予約可能な名前リストを生成
 * @param mode
 * @param key
 */
function comboBoxReserveNameList(mode, key, date, f_id) {
    var url = "./ajax/ajax_furigana.php";
    $.ajax({
        type: 'post',
        url: url,
        timeout: 12000,
        dataType: 'jsonp',
        data: {
            "mode": mode,
            "key": key,
            "date": date,
            "f_id": f_id,
        },
        jsonpCallback: 'nameList',
        success: function (json) {
            //一度プルダウン内を全削除
            $('#name_list > option').remove();
            $('#name_list').append($('<option>').html('----').val(0));
            //新しい値をセット
            if (json) {
                Object.keys(json).forEach(function (key) {
                    var key_data = this[key]["key"];
                    var val_data = this[key]["val"];

                    $('#name_list').append($('<option>').html(val_data).val(key_data));
                }, json);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log("XMLHttpRequest : " + XMLHttpRequest.status);
            console.log("textStatus     : " + textStatus);
            console.log("errorThrown    : " + errorThrown.message);
            alert("通信に失敗しました。");
        }
    });
}


/**
 * 欠席時対応加算のカウント取得＆備考取得(編集)
 * @param c_id
 * @param f_id
 */
function setAbsenceTimes(c_id, f_id) {

    var s_date = $("[name=date]").val();
    var date = new Date(s_date);
    var month = date.getMonth() + 1;
    var url = "./ajax/ajax_get_absence_times.php?c_id=" + c_id + "&date=" + s_date + "&f_id=" + f_id;
    var absence_click_count = 0;

    var all_edit_flg = $("#js_all_edit_flg").length;

    //一括編集画面の場合
    if (all_edit_flg === 1) {
        absence_click_count = $('[name="list[' + GlobalR_id + '][absence_click_count]"]').val();
    }

    //一括編集画面で1回でも欠席時対応加算を選択した場合
    if (absence_click_count == 1) {

        var absence_times = parseInt($(GlobalAbsence).attr('abs_times'));
        $('.absenceTimes').html(month + '月欠席' + absence_times + '回');

        //欠席時対応加算の理由を取得
        var absence_note = $('[name="list[' + GlobalR_id + '][absence_note]"]').val();
        $("[name=absence_note]").val(absence_note);
        $("[name=absence_note3]").val(absence_note);

        //欠席時対応加算の記録者を取得
        var absence_note_staff = $('[name="list[' + GlobalR_id + '][absence_note_staff]"]').val();
        $("[name=dialog_absence_note_staff]").val(absence_note_staff);
        $("[name=dialog_absence_note_staff3]").val(absence_note_staff);

    } else {

        $.ajax({
            url: url,
            type: 'get',
            timeout: 3000,
            async: false,
            dataType: 'json',
            success: function (data) {
                // absence_sum(欠席数合計)がnullでない場合、かつ数値の場合
                if (data["absence_sum"] !== null && $.isNumeric(data["absence_sum"])) {
                    $('.absenceTimes').html(month + '月欠席' + data["absence_sum"] + '回');
                } else {
                    $('.absenceTimes').html('');    // 欠席回数が0回の場合は空欄にする
                }

                var absence_note = $('[name="list[' + GlobalR_id + '][absence_note]"]').val();
                var absence_note_staff = $('[name="list[' + GlobalR_id + '][absence_note_staff]"]').val();
                if (absence_note) {
                    $("[name=absence_note]").val(absence_note);
                    $("[name=absence_note3]").val(absence_note);
                    $("[name=dialog_absence_note_staff]").val(absence_note_staff);
                    $("[name=dialog_absence_note_staff3]").val(absence_note_staff);
                    $('[name="list[' + GlobalR_id + '][reason_text]"]').html(absence_note_staff);
                } else {
                    //記録者をリセットして、ベース文を挿入
                    $("[name=dialog_absence_note_staff]").val(0);
                    $("#js_absence_note_dialog").val(data["absence_note"]);
                    $("#js_absence_note_dialog3").val(data["absence_note"]);
                    if ($('[name="list[' + GlobalR_id + '][reason_text]"]')) {
                        $('[name="list[' + GlobalR_id + '][reason_text]"]').html(data["absence_note"]);
                        $('[name="list[' + GlobalR_id + '][absence_note]"]').val(data["absence_note"]);
                    }
                }

            },
            error: function () {
                alert("通信に失敗しました。");
            }
        });
    }

    return;
}


/**
 * 入室時間保存準備(一覧)
 * @param r_id     予約ID
 * @param is_mail  メール通知設定フラグ
 * @param c_id     児童ID
 * @param f_id     施設ID
 * @param attend_flg 出欠席
 * @param linkage  送迎情報との連携可否
 * @param date  日付
 * @param strength_action  強度行動障害との連携可否
 * @param special_support  特別支援加算との連携可否
 * @param meal_add  食事提供加算との連携可否
 */
function sendEnterMail(r_id, is_mail, c_id, f_id, attend_flg, linkage, date, strength_action, special_support, meal_add) {

    //メール送信時
    if (is_mail == '1') {

        //hiddenリセット
        HiddenReset();

        // 前データ削除のため一度初期化する
        globalSendLeaveMailDataList = {};

        $('#addtend_dialog_mail').dialog('open');
        $("#hidden_attendance_type").text(1);
        $("#hidden_r_id").text(r_id);
        $("#hidden_is_mail").text(is_mail);
        $("#hidden_c_id").text(c_id);
        $("#hidden_f_id").text(f_id);
        $("#hidden_attend_flg").text(attend_flg);
        $("#hidden_linkage").text(linkage);
        $("#hidden_date").text(date);
        $("#hidden_strength_action").text(strength_action);
        $("#hidden_special_support").text(special_support);
        $("#hidden_meal_add").text(meal_add);
        return false;

    } else {

        var data_list = {};
        data_list["attendance_type"] = 1;
        data_list["r_id"] = r_id;
        data_list["mail_flg"] = 0;
        data_list["c_id"] = c_id;
        data_list["f_id"] = f_id;
        data_list["attend_flg"] = attend_flg;
        data_list["linkage"] = linkage;
        data_list["date"] = date;
        data_list["strength_action"] = strength_action;
        data_list["special_support"] = special_support;
        data_list["meal_add"] = meal_add;

        //メール送信しない場合は、そのまま実績登録
        AttendanceSave(data_list);
    }
}


/**
 * 退室時間保存準備(別環境で入室時間・提供形態登録後、画面更新していない環境での退室実績登録に対応するための処理)
 *
 * @param {number} r_id - 予約ID
 * @param {number} is_mail - メール通知設定フラグ
 * @param {number} c_id - 児童ID
 * @param {number} f_id - 施設ID
 * @param {number} attend_flg - 出席フラグ
 * @param {number} linkage - 連動フラグ
 */
function sendLeaveMail(r_id, is_mail, c_id, f_id, attend_flg, linkage) {

    // 入室時間を取得
    let enter_time = $.trim($('#enter' + r_id).find('span').text()).split(':').map(Number);

    // 提供形態を取得
    let providing_type = null;
    if ($('.children' + r_id).data('providing_type')) {
        providing_type = parseInt($(`.children${r_id}`).data('providing_type'));
    }

    // 最新の入室時間、提供形態を取得
    $.ajax({
        url: 'ajax/ajax_attendance.php',
        type: 'GET',
        data: {
            action: 'getEnterTimeAndProvidingType',
            r_id: r_id
        },
        dataType: 'json',
        success: function(response) {

            // DOM要素から取得した入室時間・提供形態がDBの入室時間・提供形態と異なる場合、DBの値で更新
            // 入室時間
            if (response.entering_room_time) {
                let entering_room_time = response.entering_room_time;

                // 0000-00-00 00:00:00 の形式から時間部分（00:00）を抽出
                let time_part = entering_room_time.split(' ')[1].split(':');

                // 入室時間を更新
                enter_time = time_part.slice(0, 2).map(Number);

                // 入室時間が更新された場合、画面表示を更新
                $(`#enter${r_id}`).html(`<b><span class='green'>${time_part[0]}:${time_part[1]}</span></b>`);
            }

            // 提供形態
            let current_providing_type = null;
            if (response.providing_type) {
                current_providing_type = parseInt(response.providing_type);
                if ((current_providing_type !== providing_type)) {

                    // 提供形態を更新
                    providing_type = current_providing_type;

                    // 提供形態が更新された場合、画面表示を更新
                    $(`#providing${r_id}`).html(`<b><span class='green'>${response.type_name}</span></b>`);
                }
            }

            // 続きの退室時間保存準備
            continueSendLeaveMail(r_id, is_mail, c_id, f_id, attend_flg, linkage, enter_time, providing_type);
        }
    });
}

/**
 * 退室時間保存準備(一覧)
 *
 * @param {number} r_id - 予約ID
 * @param {number} is_mail - メール通知設定フラグ
 * @param {number} c_id - 児童ID
 * @param {number} f_id - 施設ID
 * @param {number} attend_flg - 出席フラグ
 * @param {number} linkage - 連動フラグ
 * @param {string} providing_type - 提供形態
 */
function continueSendLeaveMail(r_id, is_mail, c_id, f_id, attend_flg, linkage, enter_time, providing_type = null) {

    // 利用サービスを取得
    var use_services = $(".children" + r_id).find(".realname").data("use_services");

    // 重心施設・重心児童フラグを取得
    var severe_only_flg = $(".children" + r_id).data("severe_only_flg");

    // 選択された日付を取得
    var select_date = $("[name=date]").val();

    // 日付を配列に分割
    var select_date_ary = select_date.split('-');

    // 選択された日付のDateオブジェクトを作成
    var startDate = new Date(select_date_ary[0], select_date_ary[1] - 1, select_date_ary[2], 0, 0, 0);

    // 2024年4月1日のDateオブジェクトを作成
    var checkDate2024 = new Date(2024, 3, 1, 0, 0, 0);

    // 入室時間を取得
    var enter_time = $.trim($("#enter" + r_id).find('span').text()).split(':').map(Number);

    // 現在時間を取得
    var now = new Date();

    // 退室時間を現在時間に設定
    var leave_time = [now.getHours(), now.getMinutes()];

    // 利用サービスが2未満または選択された日付が2024年4月1日以降の場合
    if ((use_services < 2) || startDate >= checkDate2024) {
        // 選択された日付が2021年4月1日以降の場合
        if (startDate >= new Date(2021, 3, 1, 0, 0, 0)) {
            // 利用時間の差を計算
            var diff_check_time = checkAttendanceDiffTime(select_date, enter_time[0], enter_time[1], leave_time[0], leave_time[1]);

            // 利用時間が30分未満の場合
            if ((diff_check_time < 30) && diff_check_time !== null) {
                lessThanThirty(r_id, c_id, f_id, is_mail, attend_flg, providing_type, severe_only_flg, linkage, select_date, enter_time, leave_time, diff_check_time);

            // 利用時間が30分以上の場合
            } else {

                // 入退室時間をHH:mm形式に変換
                let enter_time_hi = enter_time[0] + ":" + enter_time[1];
                let leave_time_hi = leave_time[0] + ":" + leave_time[1];

                overThirty(r_id, c_id, f_id, is_mail, attend_flg, providing_type, severe_only_flg, linkage, select_date, enter_time_hi, leave_time_hi, diff_check_time);
            }
        }
    }
}


/**
 * 利用時間が30分未満の場合の処理を行う関数
 *
 * @param {number} r_id - 予約ID
 * @param {number} c_id - 児童ID
 * @param {number} f_id - 施設ID
 * @param {number} is_mail - メール通知設定フラグ
 * @param {number} attend_flg - 出席フラグ
 * @param {number} providing_type - 提供形態
 * @param {number} severe_only_flg - 重心施設・重心児童フラグ
 * @param {number} linkage - 連動フラグ
 * @param {string} select_date - 選択された日付
 * @param {array} enter_time - 入室時間（[時間, 分]）
 * @param {array} leave_time - 退室時間（[時間, 分]）
 * @param {number} diff_check_time - 利用時間の差（分単位）
 */
function lessThanThirty(r_id, c_id, f_id, is_mail, attend_flg, providing_type, severe_only_flg, linkage, select_date, enter_time, leave_time, diff_check_time) {

    // 利用時間書き換えフラグ
    var change_attendance_flg = 1;

    // 30分未満ダイアログに値をセット
    setDialogValues(enter_time, leave_time, diff_check_time);

    // 必要なデータを一時的にDOM要素に保存
    $('#exit_button').data({
        r_id: r_id,
        c_id: c_id,
        f_id: f_id,
        is_mail: is_mail,
        attend_flg: attend_flg,
        providing_type: providing_type,
        severe_only_flg: severe_only_flg,
        linkage: linkage,
        select_date: select_date,
        enter_time: enter_time,
        leave_time: leave_time,
        diff_check_time: diff_check_time,
        change_attendance_flg: change_attendance_flg
    });

    // ダイアログ時間を非表示にする
    $('.js_dialog_time').hide();
    // ダイアログを開く
    $('#exit_button').dialog('open');
    // ダイアログ時間を表示する
    $('.js_dialog_time').show();
    // 欠席ボタンを表示する
    $('.js_thirty_button_absence').show();
}


/**
 * 利用時間が30分以上の場合の処理を行う関数
 *
 * @param {number} r_id - 予約ID
 * @param {number} c_id - 児童ID
 * @param {number} f_id - 施設ID
 * @param {number} is_mail - メール通知設定フラグ
 * @param {number} attend_flg - 出席フラグ
 * @param {number} providing_type - 提供形態
 * @param {number} severe_only_flg - 重心施設・重心児童フラグ
 * @param {number} linkage - 連動フラグ
 * @param {string} select_date - 選択された日付
 * @param {string} enter_time_hi - 入室時間（HH:mm形式）
 * @param {string} leave_time_hi - 退室時間（HH:mm形式）
 * @param {number} diff_check_time - 利用時間の差（分単位）
 * @param {string|null} [interval_time=null] - フォーマットされた利用時間
 * @param {number|null} [change_attendance_flg=null] - 利用時間書き換えフラグ
 */
function overThirty(r_id, c_id, f_id, is_mail, attend_flg, providing_type, severe_only_flg, linkage, select_date, enter_time_hi, leave_time_hi, diff_check_time, interval_time = null, change_attendance_flg = null) {

    let use_services = parseInt($(".children" + r_id).find(".realname").data("use_services"));

    // 利用時間フォーマット
    if (interval_time == null) {
        interval_time = formatTime(diff_check_time);
    }

    // 算定区分、算定時間数用変数の初期化
    let attend_time_div = null;
    let attend_time_set = null;
    let plantime_div = null;
    let plantime_minute = null;
    let plantime_name = '';
    let plantime_set = null;
    let time_division = null;
    let time_set = null;
    let use_plantime_flg = null;

    // 重心施設・重心児童フラグが立っていない場合
    if (severe_only_flg != 1) {

        // 実績区分、実績の算定時間数取得
        attend_time_div = getTimeDivision(diff_check_time);
        attend_time_set = getTimeSet(diff_check_time);

        // 計画区分、計画の算定時間数取得
        ({ plantime_div, plantime_minute, plantime_name } = getPlanTimeData(use_services, r_id, providing_type));
        plantime_set = getTimeSet(plantime_minute);

        // 放デイで放課後の場合に区分３の場合は区分２に変更
        let updated_time_divisions = adjustTimeDivisionsForAfterSchoolDayCare(use_services, providing_type, attend_time_div, plantime_div);
        attend_time_div = updated_time_divisions.attend_time_div;
        plantime_div = updated_time_divisions.plantime_div;

        // 実績区分と計画区分が異なる場合
        if (attend_time_div && plantime_div && attend_time_div !== plantime_div) {

            // 必要なデータを一時的にDOM要素に保存
            $('#use_plantime').data({
                r_id: r_id,
                c_id: c_id,
                f_id: f_id,
                is_mail: is_mail,
                attend_flg: attend_flg,
                providing_type: providing_type,
                linkage: linkage,
                select_date: select_date,
                enter_time_hi: enter_time_hi,
                leave_time_hi: leave_time_hi,
                diff_check_time: diff_check_time,
                interval_time: interval_time,
                change_attendance_flg: change_attendance_flg,
                attend_time_div: attend_time_div || null,
                plantime_div: plantime_div || null,
                plantime_name: plantime_name || '',
                plantime_minute: plantime_minute || null,
                attend_time_set: attend_time_set || null,
                plantime_set: plantime_set || null,
            });

            // 算定方法選択ダイアログを開く
            $('#use_plantime').dialog('open');

            // 記録者と理由を初期化
            $('#use_plantime').find('.js_staff').val(0).end().find('.js_reason').val("");

            // 実績区分を表示＋実績時間数セット
            $('.js_usetime').html(interval_time);
            $('.js_usetime_div').html('［算定区分' + attend_time_div + '］');
            $('.js_use_plantime').eq(0).attr('data-time_division', attend_time_div);
            $('.js_use_plantime').eq(0).attr('data-time_set', attend_time_set);


            // 計画区分を表示＋計画時間数、計画算定フラグをセット
            $('.js_plantime').html(plantime_name);
            $('.js_plantime_div').html('［算定区分' + plantime_div + '］');
            $('.js_use_plantime').eq(1).attr('data-time_division', plantime_div);
            $('.js_use_plantime').eq(1).attr('data-time_set', plantime_set);
            $('.js_use_plantime').eq(1).attr('data-plantime_flg', USE_PLAN_TIME);

            return false;

        } else {

            // 計画区分と実績区分が一致する場合
            if (attend_time_div == plantime_div && plantime_div) {
                use_plantime_flg = USE_PLAN_TIME;
                time_division = plantime_div;
                time_set = plantime_set;

            // 計画区分が存在しない場合
            } else if (attend_time_div && !plantime_div) {
                use_plantime_flg = USE_ATTEND_TIME;
                time_division = attend_time_div;
                time_set = attend_time_set;
            }
        }

    // 重心施設・重心児童フラグが立っている場合
    } else {

        // 計画が存在すれば計画の算定時間数を保存、存在しなければ実績の算定時間数を保存
        ({ plantime_div, plantime_minute, plantime_name } = getPlanTimeData(use_services, r_id, providing_type));

        if (plantime_minute) {
            plantime_set = getTimeSet(plantime_minute);
            time_set = plantime_set;
        } else {
            attend_time_set = getTimeSet(diff_check_time);
            time_set = attend_time_set;
        }
    }

    // data_listに必要なデータをセット
    setAttendanceSaveData(
        r_id,
        c_id,
        f_id,
        is_mail,
        attend_flg,
        providing_type,
        linkage,
        select_date,
        enter_time_hi,
        leave_time_hi,
        diff_check_time,
        interval_time,
        change_attendance_flg,
        plantime_div,
        use_plantime_flg,
        time_division,
        time_set,
    );
}


//「現在利用時間が30分未満になっております」の反映を押した場合
$(document).on('click', '.js_thirty_button', function () {

    data = $('#exit_button').data();

    // エラー非表示
    $(".js_exit_button_error").hide();

    var start_hour = $("[name=dialog_s_hour]").val();
    var start_min = $("[name=dialog_s_min]").val();
    var end_hour = $("[name=dialog_e_hour]").val();
    var end_min = $("[name=dialog_e_min]").val();

    var new_diff_check_time = checkAttendanceDiffTime(data.select_date, start_hour, start_min, end_hour, end_min);
    var interval_time = formatTime(new_diff_check_time); // 利用時間のフォーマット

    // 入退室時間のフォーマット
    var enter_time_hi = start_hour + ':' + (start_min < 10 ? '0' + start_min : start_min);
    var leave_time_hi = end_hour + ':' + (end_min < 10 ? '0' + end_min : end_min);

    var select_date_ary = data.select_date.split('-');

    // 入室時間と退室時間のチェック
    if ($.isNumeric(start_hour) && (start_hour >= 0) && $.isNumeric(start_min) && (start_min >= 0)) {
        var date1 = new Date(select_date_ary[0], select_date_ary[1], select_date_ary[2], start_hour, start_min, 0);
        var check_date1 = date1.getTime();
    }

    if ($.isNumeric(end_hour) && (end_hour >= 0) && $.isNumeric(end_min) && (end_min >= 0)) {
        var date2 = new Date(select_date_ary[0], select_date_ary[1], select_date_ary[2], end_hour, end_min, 0);
        var check_date2 = date2.getTime();
    }

    // 時間の関係が正しくない場合はエラー表示
    if ((check_date1 > check_date2)) {
        $(".js_exit_button_error").show();
        return false;
    }

    // 変更した時間が30分以上の場合
    if (new_diff_check_time >= 30) {

        overThirty(data.r_id, data.c_id, data.f_id, data.is_mail, data.attend_flg, data.providing_type, data.severe_only_flg, data.linkage, data.select_date, enter_time_hi, leave_time_hi, new_diff_check_time, interval_time, data.change_attendance_flg);

    // 変更した時間が30分未満の場合
    } else if ((new_diff_check_time < 30) && (new_diff_check_time != null)) {

        // data_listに必要なデータをセット
        setAttendanceSaveData(
            data.r_id,
            data.c_id,
            data.f_id,
            data.is_mail,
            data.attend_flg,
            data.providing_type,
            data.linkage,
            data.select_date,
            enter_time_hi,
            leave_time_hi,
            new_diff_check_time,
            interval_time,
            data.change_attendance_flg,
        );
    }

    $('#exit_button').dialog('close');
});

//「現在利用時間が30分未満になっております」の利用時間を変更した場合
$(document).on('change', '[name=dialog_s_hour], [name=dialog_s_min], [name=dialog_e_hour], [name=dialog_e_min]', function () {

    var select_date = $("[name=date]").val();
    var start_hour = $("[name=dialog_s_hour]").val();
    var start_min = $("[name=dialog_s_min]").val();
    var end_hour = $("[name=dialog_e_hour]").val();
    var end_min = $("[name=dialog_e_min]").val();

    // 実績時間の差を返す
    var diff_check_time = checkAttendanceDiffTime(select_date, start_hour, start_min, end_hour, end_min);

    if (diff_check_time != null) {
        $("#dialog_service_time").text(diff_check_time);
        // 30分未満の場合
        if (diff_check_time < 30) {
            $("#dialog_service_time").addClass("red");
            // 欠席として扱う
            if ($('.js_thirty_button_absence').length) {
                $('.js_thirty_button_absence').show();
            }
        } else {
            $("#dialog_service_time").removeClass("red");
            // 欠席として扱う
            if ($('.js_thirty_button_absence').length) {
                $('.js_thirty_button_absence').hide();
            }
        }
    } else {
        $("#dialog_service_time").text(0).addClass("red");
        // 欠席として扱う
        if ($('.js_thirty_button_absence').length) {
            $('.js_thirty_button_absence').show();
        }
    }
});

//「現在利用時間が30分未満になっております」もしくは「実績区分が計画区分と異なっています」で欠席として扱うを押した場合
$(document).on('click', '.js_thirty_button_absence', function () {

    // 「現在利用時間が30分未満になっております」の場合
    data_thirty = $('#exit_button').data();

    // 「実績区分が計画区分と異なっています」の場合
    data_division = $('#use_plantime').data();

    var data_list = {};
    data_list["attendance_type"] = 1;
    data_list["r_id"] = data_division.r_id || data_thirty.r_id;
    data_list["c_id"] = data_division.c_id || data_thirty.c_id;
    data_list["f_id"] = data_division.f_id || data_thirty.f_id;
    data_list["attend_flg"] = 3;
    data_list["date"] = data_division.select_date || data_thirty.select_date;

    // 「実績区分が計画区分と異なっています」で欠席として扱うを押した場合
    if (data_division.r_id) {
        data_list["time_division"] = "";

    // 「現在利用時間が30分以内になっております」で欠席として扱うを押した場合
    } else {
        data_list["change_attendance_flg"] = 1;
    }

    // 30分未満のクラスを削除
    $(".children" + data_list["r_id"]).find(".thirtyTime").removeClass();

    // 実績登録
    AttendanceSave(data_list);
});


//算定方法の選択（計画か実績）のボタンを押した場合（算定方法選択ダイアログ）
$(document).on('click', '.js_use_plantime', function () {

    is_button_clicked = true;

    let data = $('#use_plantime').data();

    let use_plantime_flg = $(this).attr('data-plantime_flg');
    let time_division = $(this).attr('data-time_division');
    let time_set = $(this).attr('data-time_set');
    let reason_staff = $('.js_staff').val();
    let reason = $('.js_reason').val();
    let showed_modal_flg = true; //　算定方法の選択ダイアログ表示フラグ
    let after_modal_flg = null; // 延長支援加算モーダル操作後に実行するフラグ

    // data_listに必要なデータをセット
    setAttendanceSaveData(
        data.r_id,
        data.c_id,
        data.f_id,
        data.is_mail,
        data.attend_flg,
        data.providing_type,
        data.linkage,
        data.select_date,
        data.enter_time_hi,
        data.leave_time_hi,
        data.diff_check_time,
        data.interval_time,
        data.change_attendance_flg,
        data.plantime_div,
        use_plantime_flg,
        time_division,
        time_set,
        reason_staff,
        reason,
        data.after_providing_flg,
        after_modal_flg,
        showed_modal_flg,
    );

    // ダイアログを閉じる
    $('#use_plantime').dialog('close');
});


//「保護者にメールを送信してよろしいですか?」内のボタンを押した場合（メール通知ダイアログ）
$(document).on('click', '.send_mail_button', function () {

    var r_id = $("#hidden_r_id").text();
    var date = $("#hidden_date").text();

    // グローバル変数からdata_listを取得
    let data_list = globalSendLeaveMailDataList;

    // data_listが存在しない場合はhiddenから取得（入室時用）
    if (!data_list || Object.keys(data_list).length === 0) {
        data_list = {};  // 空のオブジェクトとして初期化
        data_list["date"] = date;
        data_list["r_id"] = r_id;
        data_list["c_id"] = $("#hidden_c_id").text();
        data_list["f_id"] = $("#hidden_f_id").text();
        data_list["attend_flg"] = $("#hidden_attend_flg").text();
        data_list["hidden_mail_only"] = $("#hidden_mail_only").text();
        data_list["attendance_type"] = $("#hidden_attendance_type").text();
        data_list["anther_services"] = $("#hidden_anther_services").text();
        data_list["linkage"] = $("#hidden_linkage").text();
        data_list["strength_action"] = $("#hidden_strength_action").text();
        data_list["special_support"] = $("#hidden_special_support").text();
        data_list["meal_add"] = $("#hidden_meal_add").text();
        data_list["houmon_special_add"] = $("#hidden_houmon_special_add").text();
    }

    // メール送信可否
    data_list["mail_flg"] = $(this).data("send_mail");

    // 実績登録に遷移
    AttendanceSave(data_list);

    // 保存処理後はグローバル変数を初期化
    globalSendLeaveMailDataList = {};

    // メール送信ダイアログを閉じる
    $('#addtend_dialog_mail').dialog('close');
});


/**
 * 出席データを保存するためのデータリストを設定（保存）する関数
 *
 * @param {number} r_id - レコードID
 * @param {number} c_id - 児童ID
 * @param {number} f_id - 施設ID
 * @param {number} is_mail - メール通知設定フラグ
 * @param {number} attend_flg - 出席フラグ
 * @param {number} providing_type - 提供形態
 * @param {number} linkage - 連動フラグ
 * @param {string} select_date - 選択された日付
 * @param {string} enter_time_hi - 入室時間（HH:mm形式）
 * @param {string} leave_time_hi - 退室時間（HH:mm形式）
 * @param {number} diff_check_time - 利用時間の差（分単位）
 * @param {string} interval_time - フォーマットされた利用時間
 * @param {number} change_attendance_flg - 利用時間変更フラグ
 * @param {string|null} [plantime_div=null] - 計画区分
 * @param {number|null} [use_plantime_flg=null] - 算定方法
 * @param {string|null} [time_division=null] - 算定区分
 * @param {number|null} [time_set=null] - 算定時間数
 * @param {string|null} [reason_staff=null] - 理由（スタッフ）
 * @param {string|null} [reason=null] - 理由
 * @param {number|null} [after_providing_flg=null] - 退室登録後に提供形態を選択したフラグ
 * @param {number|null} [after_modal_flg=null] - 延長支援加算モーダル操作後に実行するフラグ
 */
function setAttendanceSaveData(r_id, c_id, f_id, is_mail, attend_flg, providing_type, linkage, select_date, enter_time_hi, leave_time_hi, diff_check_time, interval_time, change_attendance_flg, plantime_div = null, use_plantime_flg = null, time_division = null, time_set = null, reason_staff = null, reason = null, after_providing_flg = null, after_modal_flg = null, showed_modal_flg = null) {

    // 入室時間を空白消して取得
    var enter_time_ary = enter_time_hi.split(':');
    enter_time_ary[0] = Number(enter_time_ary[0]);
    enter_time_ary[1] = Number(enter_time_ary[1]);

    // 退室時間を空白消して取得
    var leave_time_ary = leave_time_hi.split(':');
    leave_time_ary[0] = Number(leave_time_ary[0]);
    leave_time_ary[1] = Number(leave_time_ary[1]);

    // 利用サービスを取得
    let use_services = parseInt($(".children" + r_id).find(".realname").data("use_services"));

    // データリストの初期化
    let data_list = {};
    data_list['date'] = select_date;
    data_list['r_id'] = r_id;
    data_list['c_id'] = c_id;
    data_list['f_id'] = f_id;
    data_list['hidden_mail_only'] = $('#hidden_mail_only').text();
    data_list['attend_flg'] = attend_flg;
    data_list['attendance_type'] = 2;
    data_list['providing_type'] = providing_type;
    data_list['linkage'] = linkage;
    data_list['change_attendance_flg'] = change_attendance_flg;
    data_list['enter_time_hi'] = enter_time_hi;
    data_list['leave_time_hi'] = leave_time_hi;
    data_list['s_hour'] = enter_time_ary[0];
    data_list['s_min'] = enter_time_ary[1];
    data_list['e_hour'] = leave_time_ary[0];
    data_list['e_min'] = leave_time_ary[1];
    data_list['diff_check_time'] = parseInt(diff_check_time, 10);
    data_list['interval_time'] = interval_time;
    data_list['plan_time_div'] = parseInt(plantime_div) || parseInt($(`.children${r_id}`).data('plan_time_div'));
    data_list['use_plantime_flg'] = parseInt(use_plantime_flg);
    data_list['time_division'] = parseInt(time_division);
    data_list['time_set'] = time_set;
    data_list['reason_staff'] = reason_staff || null;
    data_list['reason'] = reason || null;
    data_list['showed_modal_flg'] = showed_modal_flg || null; //　算定方法の選択ダイアログ表示かつ選択済フラグ

    // 退室実績登録後に提供形態を押下した場合
    if (after_providing_flg && time_division) {
        // 算定区分を表示
        $(`.children${r_id}`).find('.js_reason_note').html(`<br>算定区分${time_division}`);
    }

    // 30分未満で提供形態が選択されている場合はリセットフラグを立てる
    if (data_list['diff_check_time'] < 30 && data_list['diff_check_time'] !== null) {
        data_list['reset_providing'] = 1;
    }

    // 法改正2024年度対応
    // 利用時間が30分以上（30分未満の場合は提供形態がリセットされるため）
    if ((new Date(select_date) >= new Date(2024, 3, 1, 0, 0, 0)) && data_list['diff_check_time'] >= 30) {

        // 放デイで提供形態が未選択の場合
        if (use_services === AFTER_SCHOOL_DAY_CARE && !data_list['providing_type']) {

            data_list['use_plantime_flg'] = null;
            data_list['time_division'] = null;
            data_list['time_set'] = null;
        }

        // 計画区分がないのに計画で算定になっている場合は実績で算定
        // ※本来はあり得ないが別表の計画記載がないのに、計画算定フラグ(2)で、区分が0で保存されていた不具合の再現取れないため臨時対応（解決すれば消してＯＫ）
        if (data_list['use_plantime_flg'] == USE_PLAN_TIME && data_list['plan_time_div'] === '') {

            data_list['use_plantime_flg'] = USE_ATTEND_TIME;
        }

    //算定しない場合
    } else if (data_list['attend_flg'] != 5) {
        data_list['use_plantime_flg'] = null;
        data_list['time_division'] = null;
        data_list['time_set'] = null;
    }

    // 延長支援加算モーダルで操作後の場合
    if (after_modal_flg) {

        // メール通知設定フラグがある場合ダイアログ表示
        if (is_mail == 1) {
            // 前データ削除のため一度初期化する
            globalSendLeaveMailDataList = {};

            // データリストをグローバル変数に保存
            globalSendLeaveMailDataList = data_list;

            // メール送信ダイアログを開く
            $('#addtend_dialog_mail').dialog('open');

        } else {
            // メール通知設定フラグがない場合はそのまま実績登録
            AttendanceSave(data_list);
        }

    } else {
        // 延長支援加算のチェック処理実行
        // 詳細：モーダル表示する場合は表示。しない場合は延長支援情報をDOMへ格納。延長支援無い場合はメール通知処理へ進む
        // 延長支援時間を取得して、延長支援時間情報とモーダルを出すか出さないかを返す処理
        getDetailExtensionData(c_id, f_id, r_id, select_date, enter_time_hi, leave_time_hi, providing_type, 'detail', change_attendance_flg, function(response) {
            if (response.modal_type !== null) {
                // モーダル出す場合はモーダルを表示
                showExtensionModal(f_id, response.data, response.form_ary, false,'detail', change_attendance_flg);

                // モーダルで操作した後に必要なデータを一時的にDOM要素に保存
                $('#modal_extension_support').attr({
                    'data-r_id': r_id,
                    'data-c_id': c_id,
                    'data-f_id': f_id,
                    'data-is_mail': is_mail,
                    'data-attend_flg': attend_flg,
                    'data-providing_type': providing_type,
                    'data-linkage': linkage,
                    'data-select_date': select_date,
                    'data-enter_time_hi': enter_time_hi,
                    'data-leave_time_hi': leave_time_hi,
                    'data-diff_check_time': diff_check_time,
                    'data-interval_time': interval_time,
                    'data-change_attendance_flg': change_attendance_flg,
                    'data-plantime_div': plantime_div || null,
                    'data-use_plantime_flg': use_plantime_flg || '',
                    'data-time_division': time_division || null,
                    'data-time_set': time_set || null,
                    'data-reason_staff': reason_staff || null,
                    'data-reason': reason || null,
                    'data-after_providing_flg': after_providing_flg || null,
                });

            } else {
                // モーダルを出さない場合はDOM要素に延長支援時間情報を挿入
                $(`#extension_support_save_${response.form_ary[0]}`).attr({'data-r_id': response.form_ary[0],});

                // 延長支援時間をセット（時間1の開始時間と終了時間、時間2の開始時間と終了時間）
                for (let i = 1; i <= 8; i++) {
                    $(`#extension_support_save_${response.form_ary[0]}`).attr(`data-extime${i}`, response.data ? response.data[i] : '');
                }

                // メール通知設定フラグがある場合ダイアログ表示
                if (is_mail == 1) {

                    // 前データ削除のため一度初期化する
                    globalSendLeaveMailDataList = {};

                    // データリストをグローバル変数に保存
                    globalSendLeaveMailDataList = data_list;

                    // メール送信ダイアログを開く
                    $('#addtend_dialog_mail').dialog('open');

                } else {
                    // メール通知設定フラグがない場合はそのまま実績登録
                    AttendanceSave(data_list);
                }
            }
        });
    }
}


/**
 * 出席データを保存する関数
 *
 * @param {object} data_list - 保存するデータのリスト
 */
function AttendanceSave(data_list) {
    // デフォルトのURLを設定
    var url = "./ajax/ajax_attendance.php";

    // 他のサービスが保育（anther_servicesが4）の場合、URLを変更
    if (data_list["anther_services"] == 4) {
        url = "./ajax/ajax_attendance_hoiku.php";
    }

    // AJAXリクエストの送信
    $.ajax({
        url: url,
        type: 'POST',
        data: {
            "data_list": data_list,
        },
        timeout: 3000,  // タイムアウト設定
        async: false,   // 同期通信
        dataType: 'json',  // データタイプをJSONに設定
        success: function (data) {
            // 保育サービスの場合の処理
            if (data_list["anther_services"] == 4) {
                if (data_list["attendance_type"] == 1) {
                    SuccessHoiku(data, data_list["r_id"], data_list["is_mail"], data_list["c_id"], data_list["f_id"], data_list["attend_flg"]);
                } else {
                    SuccessHoiku_tai(data, data_list["r_id"]);
                }
            } else {
                // hidden_mail_onlyが1の場合、メール送信ダイアログを閉じて終了（すでに実績保存済みのためメール通知のみ）
                if (data["hidden_mail_only"] == 1) {
                    $('#addtend_dialog_mail').dialog('close');
                    return false;
                } else {
                    if (data_list["attendance_type"] == 1) {
                        Success(data, data_list["r_id"], data_list["is_mail"], data_list["c_id"], data_list["f_id"], data_list["attend_flg"], data_list["linkage"], data_list["date"]);

                        // 食事追加の処理
                        const meal_add = parseInt(data_list['meal_add']);
                        if (meal_add !== 0) {
                            let eq = meal_add === 1 ? 0 : 1;
                            $('#meal' + data_list['c_id']).find('button').eq(eq).click();
                        }
                    } else {
                        if (data_list['attend_flg'] == 4) {
                            Success_tai(data, data_list["r_id"], data_list["c_id"], data_list["f_id"], data_list["date"], data_list["diff_check_time"], data_list["interval_time"], data_list["time_division"]);
                        } else if (data_list['attend_flg'] == 5) {
                            // 退室実績登録後に提供形態を選択したして、実績区分と計画区分が異なる場合
                            // 延長支援加算の連動読み込み
                            let form_ary = [];
                            form_ary.push(data_list['r_id']);
                            form_ary.push($(`.children${data_list['r_id']}`).find('.realname').data('use_services'));
                            // 延長支援時間情報の有無を確認(時間が無くとも連動していれば削除はしなければならないのでr_idのみ渡しておく)
                            let extensionSupportElement = $(`#extension_support_save_${data_list['r_id']}`).data('r_id');
                            if (extensionSupportElement) {
                                for (let i = 1; i <= 8; i++) {
                                    let ex_time = $(`#extension_support_save_${data_list['r_id']}`).attr(`data-extime${i}`);
                                    form_ary.push(ex_time !== null && ex_time !== undefined ? ex_time : '');
                                }
                                // 要素に延長支援時間情報がある場合は加算を登録する
                                setRelatedExtensionDetail(data_list['date'], data_list['c_id'], data_list['f_id'], form_ary);
                            }

                        }
                    }
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log("XMLHttpRequest : " + XMLHttpRequest.status);
            console.log("textStatus     : " + textStatus);
            console.log("errorThrown    : " + errorThrown.message);
            alert("通信に失敗しました。");
        }
    });
}


/**
 * 入室実績登録成功時の処理
 *
 * @param {object} data - サーバーからのレスポンスデータ
 * @param {number} r_id - 予約ID
 * @param {number} is_mail - メール通知設定フラグ
 * @param {number} c_id - 児童ID
 * @param {number} f_id - 施設ID
 * @param {number} attend_flg - 出席フラグ
 * @param {number} linkage - 連動フラグ
 * @param {string} date - 日付（フォーマット：YYYY-MM-DD）
 */
function Success(data, r_id, is_mail, c_id, f_id, attend_flg, linkage, date) {

    // 利用サービス取得
    var use_services = $(".children" + r_id).find(".realname").data("use_services");

    // まずr_idが仮のものをすべて変更する
    // r_idにfixが含まれている場合は対象
    // 児童の固定曜日用
    if (String(r_id).match(/fix/)) {
        // キャンセル待ちに関する部分書き換え
        $("#atnd" + r_id).closest("tr").removeClass("children" + r_id).addClass("children" + data.r_id);
        // キャンセル待ちのデータ属性入れ替え
        $("#atnd" + r_id).closest("tr").find(".waitbtn").attr('data-rid', data.r_id + ',wait,' + c_id + ',' + f_id + ',' + date).text("キャンセル待ち");
        // 放課後と学級日
        $("#atnd" + r_id).attr("id", "atnd" + data.r_id);
        $("#enter" + r_id).attr("id", "enter" + data.r_id);
        $("#leave" + r_id).attr("id", "leave" + data.r_id);
        $("#leave_mail_" + r_id).attr("id", "leave_mail_" + data.r_id);
        $("#providing" + r_id).attr("id", "providing" + data.r_id);

        // 加算登録タブ側も書き換える
        $("#js_adding_atndinfo" + r_id).attr("id", "js_adding_atndinfo" + data.r_id);
        $("#js_adding_list" + r_id).attr("id", "js_adding_list" + data.r_id);
        $("#atnd" + r_id).attr("id", "atnd" + data.r_id);

        // 提供形態のボタンを再作成（放デイのみ）
        if (use_services != 2) {
            $("#providing" + data.r_id).html("<button class=\"btn btn-sm\" onclick=\"proViding(" + data.r_id + ",1," + c_id + "," + f_id + ",'" + date + "');\">放課後</button><button class=\"btn btn-sm\" onclick=\"proViding(" + data.r_id + ",2," + c_id + "," + f_id + ",'" + date + "');\">学休日</button>");
        }

        // 弁当のボタンを再作成
        $("#lunch" + r_id).attr("id", "lunch" + data.r_id);
        var lunchNo = $("#lunch" + data.r_id).data("lunchno");
        if (lunchNo != 0 && $("#lunch" + data.r_id).find("button").length) {
            var lunchTxt = $("#lunch" + data.r_id).find("button").text();
            $("#lunch" + data.r_id).html("<button class=\"btn btn-sm\" onclick=\"lunchFlg(" + data.r_id + "," + lunchNo + "," + c_id + "," + f_id + ",'" + date + "');\">" + lunchTxt + "</button>");
        }

        // 費用エリアのID変更
        $("#cost_area" + r_id).attr("id", "cost_area" + data.r_id);
        if ($("[id^=costfix-" + c_id + "]").length) {
            $("#cost_area" + data.r_id).find(".costRow > li").each(function (i, elem) {
                var costIdData = $(elem).attr('data-costid').split(',');
                $(elem).html("<button class=\"btn btn-sm btnFree \" onclick=\"actualCost(" + f_id + ",'" + date + "'," + c_id + "," + costIdData[0] + ",'" + data.r_id + "'," + costIdData[1] + "," + costIdData[3] + ");\">" + costIdData[2] + "</button>");
                $(elem).attr("id", "cost" + data.r_id + "_" + costIdData[3] + "_" + costIdData[0]);
            });
        }
    }

    // 出席フラグが1の場合
    if (attend_flg == 1) {
        $("#enter" + data.r_id).html("<b><span class=\"green\">" + data.time + "</span></b>");
        var leave_mail = $("#leave_mail_" + data.r_id).text();
        $("#leave" + data.r_id).html("<button class=\"btn btn-sm\" onclick=\"sendLeaveMail(" + data.r_id + "," + leave_mail + "," + c_id + "," + f_id + ",4," + linkage + ");\">退室</button>");

        // スマートフォンの場合の表示設定
        var spWidth = 768;
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        if (width >= spWidth) {
            $("#leave" + data.r_id).css("display", "table-cell");
        }

        // 医ケアの基本報酬を算定する場合
        if (data["medical_care_note"]) {
            $(".children" + data.r_id).find(".medical_care_note").show().text(data["medical_care_note"]);
        }

        // 加算の登録により追加
        $("#js_adding_atndinfo" + data.r_id).text("出席");

        // 連動の調整
        setAddingRelated(data, date);

        // メール送信用ダイアログ非表示
        $('#addtend_dialog_mail').dialog('close');

    } else {
        // 欠席フラグが2の場合
        if (attend_flg == 2) {
            $("#enter" + data.r_id).html("<b><span class=\"red js_attend_absenceflg2\">" + data.time + "</span></b>");
            $("#js_adding_atndinfo" + data.r_id).html("<b><span class=\"red js_attend_absenceflg2\">" + data.time + "</span></b>");
        // 欠席フラグが3の場合
        } else if (attend_flg == 3) {
            $("#enter" + data.r_id).html("<b><span class=\"red js_attend_absenceflg3\">" + data.time + "</span></b>");
            $("#js_adding_atndinfo" + data.r_id).html("<b><span class=\"red js_attend_absenceflg3\">" + data.time + "</span></b>");
        }
        $("#providing" + data.r_id).text("").css("display", "table-cell");

        // 食事提供加算がある場合は無しに変更
        if ($("#meal" + c_id).length) {
            $("#meal" + c_id).html('<b>無し</b>');
        }

        // 欠席時対応加算用ダイアログ非表示
        $('#addtend_dialog').dialog('close');

        // 欠席として扱う
        if ($('#exit_button').length && attend_flg == 3) {
            $('#leave' + data.r_id).html('');
            $('#leave' + data.r_id).next().html('');
            $('#providing' + data.r_id).html('');
            $('#exit_button').dialog('close');
        }

        // 計画時間か、実利用時間の選択ダイアログで欠席として扱うを選択した場合
        if ($('#use_plantime').length && attend_flg == 3) {
            $('#use_plantime').dialog('close');
        }

        // 連動の調整
        setAddingRelated(data, date);
    }

    var s_id = "";
    if (data.id) {
        s_id = (use_services == 2) ? 2 : 1;
        $("#atnd" + data.r_id).html("<button class=\"btn btn-sm edit\" onclick=\"location.href='attendance.php?mode=edit&id=" + data.id + "&s_id=" + s_id + "'\">編集</button>");
        $("#js_adding_atnd" + data.r_id).html("<button class=\"btn btn-sm edit\" onclick=\"location.href='attendance.php?mode=edit&id=" + data.id + "&s_id=" + s_id + "'\">編集</button>");
        if ((attend_flg == 1 || attend_flg == 2 || attend_flg == 3) && data.lunch_flg != 0) {
            if (!$("#lunch" + data.r_id).find(".green").length) {
                $("#lunch" + data.r_id).html("<button class=\"btn btn-sm\" onclick=\"lunchFlg(" + data.r_id + "," + data.lunch_flg + "," + c_id + "," + f_id + ",'" + date + "');\">" + data.lunch_name + "</button>");
            }
        }
    }

    // hiddenリセット
    HiddenReset();
    getCancelCount();
    return;
}


/**
 * 退室実績登録成功時の処理
 *
 * @param {object} data - サーバーからのレスポンスデータ
 * @param {number} r_id - 予約ID
 * @param {number} c_id - 児童ID
 * @param {number} f_id - 施設ID
 * @param {string} date - 日付（フォーマット：YYYY-MM-DD）
 * @param {number} diff_check_time - 利用時間の差（分単位）
 * @param {string} interval_time - フォーマットされた利用時間
 * @param {string} time_division - 算定区分
 */
function Success_tai(data, r_id, c_id, f_id, date, diff_check_time, interval_time, time_division) {
    // dateをDateオブジェクトに変換
    let comparisonDate = new Date(date);

    // 利用時間変更フラグがある場合
    if (data["change_attendance_flg"] == 1) {

        // 変更後の入室時間を表示
        $("#enter" + r_id).html("<b><span class=\"green\">" + data["time_enter"] + "</span></b>");
    }

    // 退室時間を表示
    $("#leave" + r_id).html("<b><span class=\"green\">" + data["time"] + "</span></b>");

    // 利用時間がある場合
    if (diff_check_time) {
        // 利用時間を表示
        $(".children" + r_id).find(".js_utilization_time").text(interval_time);

        // 利用時間が30分未満の場合
        if ((diff_check_time < 30) && (diff_check_time != null)) {
            $(".children" + r_id).find(".js_utilization_time").parent().addClass('thirtyTime');
        } else {
            $(".children" + r_id).find(".providing").removeClass("thirtyTime");
        }

    } else {
        // 0分で表示
        $(".children" + r_id).find(".js_utilization_time").text(interval_time);
        $(".children" + r_id).find(".js_utilization_time").parent().addClass('thirtyTime');
    }

    // 提供形態をリセットする場合はボタンに戻して、欠席時対応加算Ⅱを表示
    if (data["reset_providing"] == 1) {
        let use_services = $(".children" + r_id).find(".realname").data("use_services");

        // comparisonDateが2024/04/01以降の場合
        if (comparisonDate >= new Date(2024, 3, 1, 0, 0, 0)) {
            // ３０分以内の場合
            if (data["thirtyTime"] == 1) {
                let type = (use_services == 1) ? "'regular_reward'" : '5';
                let btn1 = "<button class=\"btn btn-sm js_regular_reward\" onclick=\"proViding(" + r_id + "," + type + "," + c_id + "," + f_id + ",'" + date + "');\">基本報酬を算定する</button>";
                let btn2 = "<button class=\"btn btn-sm js_regular_reward\" onclick=\"proViding(" + r_id + ", 9 ," + c_id + "," + f_id + ",'" + date + "');\">基本報酬を算定しない</button>";
                $("#providing" + r_id).html(btn1 + '<br>' + btn2);

                let children_area = $(`.js_children_area${r_id}`);
                let plantime_area = children_area.find('.js_plantime_area');
                plantime_area.hide();
            }
        } else {
            // 児発以外の場合
            if (use_services != 2) {
                $("#providing" + r_id).html("<button class=\"btn btn-sm js_regular_reward\" onclick=\"proViding(" + r_id + ",'regular_reward'," + c_id + "," + f_id + ",'" + date + "');\">基本報酬を算定する</button>" +
                 "<button class=\"btn btn-sm\" onclick=\"proViding(" + r_id + ",'absence_two'," + c_id + "," + f_id + ",'" + date + "');\">欠席時対応加算Ⅱ</button>");

                    let children_area = $(`.js_children_area${r_id}`);
                    let plantime_area = children_area.find('.js_plantime_area');
                    plantime_area.hide();
            }
        }
    }

    // 重心施設・重心児童のフラグを取得
    var severe_only_flg = $(".children" + r_id).data("severe_only_flg");

    // 算定区分の表示（令和6年4月以降かつ重心施設・重心児童以外の場合）
    // 利用時間が30分以上の場合（30分未満の場合は提供形態がリセットされ、算定するor算定しないの選択になるため）
    if (diff_check_time >= 30) {
        if (comparisonDate >= new Date(2024, 3, 1, 0, 0, 0) && severe_only_flg !== 1) {
            if (time_division) {
                // 区分を表示
                $('.children' + r_id).find('.js_reason_note').html("<br>算定区分" + time_division);
            }
        }
    }

    // hidden一旦リセットする
    HiddenReset();

    // 利用時間変更フラグがある場合
    if (data["change_attendance_flg"] == 1) {

        // 30分未満ダイアログ非表示
        $('#exit_button').dialog('close');

        // 30分未満ダイアログで表示された欠席ボタンを非表示
        $('.js_thirty_button_absence').hide();

        // メール通知設定フラグがある場合は、そのままメールダイアログ表示
        if (data["is_mail"] == 1) {

            // メール送信ダイアログを開く
            $('#addtend_dialog_mail').dialog('open');

            $("#hidden_attendance_type").text(2);
            $("#hidden_r_id").text(r_id);
            $("#hidden_c_id").text(c_id);
            $("#hidden_f_id").text(f_id);
            $("#hidden_is_mail").text(data["is_mail"]);
            $("#hidden_mail_only").text(data["time"]); // すでに実績が保存されているためメール通知だけ行うフラグを立てる（内容は退室時間）
            $("#hidden_attend_flg").text(4);
            $("#hidden_date").text(date);
        }
    } else {
        $('#addtend_dialog_mail').dialog('close');
    }

    // 延長支援加算の連動読み込み
    let form_ary = [];
    form_ary.push(r_id);
    form_ary.push($(".children" + r_id).find(".realname").data("use_services"));
    // 延長支援時間情報の有無を確認(時間が無くとも連動していれば削除はしなければならないのでr_idのみ渡しておく)
    let extensionSupportElement = $(`#extension_support_save_${r_id}`).data('r_id');
    if (extensionSupportElement) {
        for (let i = 1; i <= 8; i++) {
            let ex_time = $(`#extension_support_save_${r_id}`).attr(`data-extime${i}`);
            form_ary.push(ex_time !== null && ex_time !== undefined ? ex_time : '');
        }
        // 要素に延長支援時間情報がある場合は加算を登録する
        setRelatedExtensionDetail(date, c_id, f_id, form_ary);
    }

    // キャンセルカウントの取得
    getCancelCount();
    return;
}


/**
 * ダイアログの値を設定する関数
 *
 * @param {array} enter_time - 入室時間（[時間, 分] の形式）
 * @param {array} leave_time_ary - 退室時間（[時間, 分] の形式）
 * @param {string} diff_check_time - 利用時間のフォーマットされた文字列
 */
function setDialogValues(enter_time, leave_time_ary, diff_check_time) {

    // 入室時間の時間部分をダイアログの該当フィールドに設定
    $("[name=dialog_s_hour]").val(enter_time[0]);
    // 入室時間の分部分をダイアログの該当フィールドに設定
    $("[name=dialog_s_min]").val(enter_time[1]);

    // 退室時間の時間部分をダイアログの該当フィールドに設定
    $("[name=dialog_e_hour]").val(leave_time_ary[0]);
    // 退室時間の分部分をダイアログの該当フィールドに設定
    $("[name=dialog_e_min]").val(leave_time_ary[1]);

    // 滞在時間をダイアログの表示フィールドに設定し、クラス「red」を追加
    $("#dialog_service_time").text(diff_check_time).addClass("red");
}


/**
 * 時間差をフォーマットする関数
 *
 * @param {number} diff_check_time - 時間差（分単位）
 * @returns {string} フォーマットされた時間差（例：'1時間30分'）
 */
function formatTime(diff_check_time) {

    let interval_time = ''; // フォーマットされた時間差を格納する変数

    var interval_time_h = parseInt(diff_check_time / 60); // 分単位の時間差を時間に変換

    // 時間が1時間以上の場合は「〇〇時間」を追加
    if (interval_time_h) {
        interval_time = interval_time_h + '時間';
    }

    // 分の部分を追加
    interval_time += parseInt(diff_check_time % 60) + '分'; // 残りの分を計算して追加

    return interval_time; // フォーマットされた時間差を返す
}


/**
 * 非表示情報リセット(編集)
 */
function HiddenReset() {

    $("#hidden_date").text("");
    $("#hidden_r_id").text("");
    $("#hidden_c_id").text("");
    $("#hidden_f_id").text("");
    $("#hidden_is_mail").text("");
    $("#hidden_mail_only").text("");
    $("#hidden_attend_flg").text("");
    $("#hidden_attendance_type").text("");
    $("#hidden_anther_services").text("");
    $("#hidden_severe_only_flg").text("");
    $("#hidden_linkage").text("");
    $("#hidden_strength_action").text("");
    $("#hidden_hidden_special_support").text("");
    $("#hidden_meal_add").text("");
    $("#hidden_houmon_special_add").text("");

    $("#dialog_service_time").text("");
}


/**
 * 値を受け取り、編集画面にリダイレクト(一覧)
 * @param url
 */
function redirectEdit(url, service_type) {

    //初期化
    var f_id = "";

    //放デイ・児発の場合
    if (service_type == 1) {
        f_id = $("#f_select").val();
    } else if (service_type == 4) {
        //保育所の場合
        f_id = $("#f_hoiku_select").val();
    } else if (service_type == 7) {
        // 障害児相談支援の場合
        f_id = $("#f_consultation_select").val();
    } else if (service_type == 9) {
        // 障害児相談支援の場合
        f_id = $("#f_plan_consultation_select").val();
    }

    //リダイレクト
    location.href = url + '&f_id=' + f_id;
}


/**
 * 提供形態(一覧)
 * 入室、退室とは別PHPでかきます。
 * @param r_id
 * @param type
 * @param c_id
 * @param f_id
 * @param date
 * @param absence_two_note
 * @param absence_two_note_staff
 */
function proViding(r_id, type, c_id, f_id, date, absence_two_note, absence_two_note_staff) {

    let children_element = $(`.children${r_id}`);


    let use_plantime_flg = USE_ATTEND_TIME;
    let time_division = null;
    let time_set = null;
    let not_get_extension_flg = false; // 延長支援時間情報を取得しないフラグ

    // 重心施設・重心児童フラグを取得
    let severe_only_flg = children_element.data("severe_only_flg");

    // 利用サービスIDを取得
    let use_services = parseInt(children_element.find('.realname').data('use_services'));

    // 欠席時対応加算Ⅱを押した場合、記録者を取得しダイアログ表示
    if (type === "absence_two") {

        // hiddenリセット
        HiddenReset();

        $("#hidden_r_id").text(r_id);
        $("#hidden_c_id").text(c_id);
        $("#hidden_f_id").text(f_id);
        $("#hidden_date").text(date);
        $("[name=absence_two_note]").val("");
        $("[name=dialog_absence_two_note_staff]").val(0);

        // 非表示にしてプルダウンが開かないようにする
        $('#addtend_dialog02').find('.comboBoxStaffJquery').hide();
        $('#js_absence_two_note_staff').hide();
        $('#js_absence_two_note_dialog').hide();
        // ダイアログ表示
        $('#addtend_dialog02').dialog('open');
        // 再表示
        $('#addtend_dialog02').find('.comboBoxStaffJquery').show();
        $('#js_absence_two_note_staff').show();
        $('#js_absence_two_note_dialog').show();

    } else if (type === "regular_reward") {

        // 基本報酬を算定するを押した場合、提供形態のボタンを表示
        if (use_services === AFTER_SCHOOL_DAY_CARE) {
            let btn1 = `<button class="btn btn-sm" onclick="proViding(${r_id}, 1, ${c_id}, ${f_id}, '${date}');">放課後</button>`;
            let btn2 = `<button class="btn btn-sm" onclick="proViding(${r_id}, 2, ${c_id}, ${f_id}, '${date}');">学休日</button>`;
            $(`#providing${r_id}`).html(btn1 + btn2);

            let children_area = $(`.js_children_area${r_id}`);
            let plantime_area = children_area.find('.js_plantime_area');
            plantime_area.hide();

        }

    } else {

        // 「実績区分が計画区分と異なっています」ダイアログで保存をした際に、算定するボタンを押さずにダイアログを閉じてしまった時でも、算定区分が保存されるようにするための保存配列
        let close_use_plantime_dialog_being_data = {};

        // 放デイは提供形態が放課後か学休日の場合　or 児発は基本報酬を算定するの場合
        if (type == 1 || type == 2 || type == 5) {

            let providing_type = parseInt(type);

            // 入室時間を空白消して取得
            let enter_time = $.trim($(`#enter${r_id}`).find('span').text());
            let enter_time_ary = enter_time.split(':').map(Number);

            // 退室時間は現在時間を取得
            let leave_time = $.trim($(`#leave${r_id}`).find('span').text());
            let leave_time_ary = leave_time.split(':').map(Number);

            if (enter_time && leave_time && $('.js_law2024').length) {
                // 実績時間の差を返す
                let diff_check_time = checkAttendanceDiffTime(date, enter_time_ary[0], enter_time_ary[1], leave_time_ary[0], leave_time_ary[1]);

                // 利用時間
                let interval_time = '';
                if (diff_check_time) {
                    interval_time = formatTime(diff_check_time);
                }

                // 算定区分、算定時間数用変数の初期化
                let attend_time_div = null;
                let attend_time_set = null;
                let plantime_div = null;
                let plantime_minute = null;
                let plantime_name = '';
                let plantime_set = null;


                // 重心施設・重心児童フラグが立っていない場合
                if (severe_only_flg != 1) {

                    // 実績区分、実績の算定時間数取得
                    attend_time_div = getTimeDivision(diff_check_time);
                    attend_time_set = getTimeSet(diff_check_time);

                    ({ plantime_div, plantime_minute, plantime_name } = getPlanTimeData(use_services, r_id, providing_type));
                    plantime_set = getTimeSet(plantime_minute);

                    // 放デイで放課後の場合に区分３の場合は区分２に変更
                    let updated_time_divisions = adjustTimeDivisionsForAfterSchoolDayCare(use_services, providing_type, attend_time_div, plantime_div);
                    attend_time_div = updated_time_divisions.attend_time_div;
                    plantime_div = updated_time_divisions.plantime_div;
                }

                // 実績区分と計画区分が異なる場合
                if ((attend_time_div && plantime_div && attend_time_div !== plantime_div) || (!attend_time_div && plantime_div)) {

                    if (diff_check_time < 30) {
                        // 30分未満の場合はデフォルトを計画で算定するように設定
                        use_plantime_flg = USE_PLAN_TIME;
                        time_division = plantime_div;
                        time_set = plantime_set;
                    } else {
                        // 「実績区分が計画区分と異なっています」ダイアログで保存をした際に、算定するボタンを押さずにダイアログを閉じてしまうと、算定するボタンを押した後の処理が実行されず算定区分が保存されない。
                        // そのため、算定するボタンを押さずにダイアログを閉じた対策として、一旦提供形態保存と一緒に、計画時間を利用するフラグ、時間区分、算定時間数を保存させておく。
                        // もし、ダイアログで正しく算定するボタンを押したのであれば、最終的に、選択したボタンに沿った情報に計画時間を利用するフラグ、時間区分、算定時間数が書き換わるので問題ない。
                        // このダイアログが表示される条件が、計画区分が存在する場合しか通らないので、計画区分がなかった場合の実績区分のチェックはしない。
                        close_use_plantime_dialog_being_data.use_plantime_flg = USE_PLAN_TIME;
                        close_use_plantime_dialog_being_data.time_division = plantime_div;
                        close_use_plantime_dialog_being_data.time_set = plantime_set;
                    }

                    // 必要なデータを一時的にDOM要素に保存
                    $('#use_plantime').data({
                        r_id: r_id,
                        c_id: c_id,
                        f_id: f_id,
                        attend_flg: 5,
                        providing_type: providing_type,
                        after_providing_flg: true,
                        select_date: date,
                        enter_time_hi: enter_time,
                        leave_time_hi: leave_time,
                        diff_check_time: diff_check_time,
                        interval_time: interval_time,
                        attend_time_div: attend_time_div || null,
                        plantime_div: plantime_div || null,
                        plantime_name: plantime_name || '',
                        attend_time_set: attend_time_set || null,
                        plantime_set: plantime_set || null,
                    });

                    // 算定方法選択ダイアログを開く
                    $('#use_plantime').dialog('open');

                    // 記録者と理由を初期化
                    $('#use_plantime').find('.js_staff').val(0).end().find('.js_reason').val("");

                    // 実績区分を表示＋実績時間数セット
                    //実績の算定時間数を表示
                    if(diff_check_time >= 30) {
                        $('.js_usetime').html(interval_time);
                    }else{
                        $('.js_usetime').html("30分未満");
                    }

                    //実績の算定区分を表示
                    if(attend_time_div) {
                        $('.js_usetime_div').html('［算定区分' + attend_time_div + '］');
                    }else{
                        $('.js_usetime_div').html('［算定区分なし］');
                    }

                    $('.js_use_plantime').eq(0).attr('data-time_division', attend_time_div);
                    $('.js_use_plantime').eq(0).attr('data-time_set', attend_time_set);


                    // 計画区分を表示＋計画時間数、計画算定フラグをセット
                    $('.js_plantime').html(plantime_name);
                    $('.js_plantime_div').html('［算定区分' + plantime_div + '］');
                    $('.js_use_plantime').eq(1).attr('data-time_division', plantime_div);
                    $('.js_use_plantime').eq(1).attr('data-time_set', plantime_set);
                    $('.js_use_plantime').eq(1).attr('data-plantime_flg', USE_PLAN_TIME);

                    // ここでダイアログ出す場合は延長支援加算の連動処理を別で実行するためフラグ格納
                    not_get_extension_flg = true;

                // 実績区分と計画区分が同じ場合
                } else if (attend_time_div === plantime_div && plantime_div && attend_time_div) {
                        // 計画区分を表示
                        children_element.find('.js_reason_note').html(`<br>算定区分${plantime_div}`);

                        use_plantime_flg = USE_PLAN_TIME;
                        time_division = plantime_div;
                        time_set = plantime_set;

                // 計画がない場合
                } else if (attend_time_div && !plantime_div) {
                    // 実績区分を表示
                    children_element.find('.js_reason_note').html(`<br>算定区分${attend_time_div}`);

                    time_division = attend_time_div;
                    time_set = attend_time_set;
                }
            }
        }

        let url = "./ajax/ajax_attendance_providing.php";

        $.ajax({
            url: url,
            data: {
                "r_id": r_id,
                "type": type,
                "c_id": c_id,
                "f_id": f_id,
                "date": date,
                "absence_two_note": absence_two_note,
                "absence_two_note_staff": absence_two_note_staff,
                "use_plantime_flg": use_plantime_flg,
                "time_division": time_division,
                "time_set": time_set,
                "close_use_plantime_dialog_being_data": close_use_plantime_dialog_being_data,
            },
            timeout: 3000,
            async: false,
            dataType: 'json',
            success: function (data) {
                Success_providing(data, r_id, c_id, f_id, date);
            }
        });
    }

    if (!not_get_extension_flg) {
        // 延長支援加算の連動処理
        let enter_time_hi = $.trim($(`#enter${r_id}`).find('span').text());
        let leave_time_hi = $.trim($(`#leave${r_id}`).find('span').text());

        // 延長支援時間を取得して、延長支援時間情報とモーダルを出すか出さないかを返す処理
        getDetailExtensionData(c_id, f_id, r_id, date, enter_time_hi, leave_time_hi, type,'detail', false,function(response) {
            if (response.modal_type !== null) {
                // モーダルを表示
                showExtensionModal(f_id, response.data, response.form_ary, true, 'detail');
            } else {
                // モーダルを出さない場合はDOM要素に延長支援時間情報を挿入
                $(`#extension_support_save_${r_id}`).attr({'data-r_id': response.form_ary[0],});

                // 延長支援時間をセット（時間1の開始時間と終了時間、時間2の開始時間と終了時間）
                for (let i = 1; i <= 8; i++) {
                    $(`#extension_support_save_${r_id}`).attr(`data-exTime${i}`, response.data ? response.data[i] : '');
                }

                let form_ary = [];
                form_ary.push(r_id);
                form_ary.push($(".children" + r_id).find(".realname").data("use_services"));

                // 延長支援時間情報の有無を確認(時間が無くとも連動していれば削除はしなければならないのでr_idのみ渡しておく)
                let extensionSupportElement = $(`#extension_support_save_${r_id}`).data('r_id');
                if (extensionSupportElement) {
                    for (let i = 1; i <= 8; i++) {
                        let ex_time = $(`#extension_support_save_${r_id}`).attr(`data-extime${i}`);
                        form_ary.push(ex_time !== null && ex_time !== undefined ? ex_time : '');
                    }
                    setRelatedExtensionDetail(date, c_id, f_id, form_ary);
                }
            }
        });
    }

    getCancelCount();
}


/**
 * 提供形態切り替え(一覧)
 * @param data
 * @param r_id
 * @param c_id
 * @param f_id
 * @param date
 */
function Success_providing(data, r_id, c_id, f_id, date) {
    //r_idの生成が行われていない場合r_idにはfix文字列
    //まずr_idが仮のものをすべて変更する
    //r_idにfixが含まれている場合は対象
    //児童の固定曜日用
    if (String(r_id).match(/fix/)) {
        //入室のボタン等のonclickを入れ替え
        //キャンセル待ちに関する部分書き換え
        $("#atnd" + r_id).closest("tr").removeClass("children" + r_id).addClass("children" + data.r_id);
        //キャンセル待ちのデータ属性入れ替え
        $("#atnd" + r_id).closest("tr").find(".waitbtn").attr('data-rid', data.r_id + ',wait,' + c_id + ',' + f_id + ',' + date).text("キャンセル待ち");
        //入室退室
        $("#atnd" + r_id).attr("id", "atnd" + data.r_id);

        //data属性を取得し、各種設定を反映する
        $("#enter" + r_id).attr("id", "enter" + data.r_id);
        var cidSetting = $("#enter" + data.r_id).data("cidsetting");
        $("#enter" + data.r_id).html("<button class=\"btn btn-sm\" onclick=\"sendEnterMail(" + data.r_id + "," + cidSetting[0] + "," + c_id + "," + f_id + ",1," + cidSetting[1] + ",'" + date + "'," + cidSetting[2] + ");\">入室</button><button class=\"btn btn-sm jqeryui-absence\" id=\"absence_" + data.r_id + "_" + c_id + "_" + f_id + "_" + date + "_" + cidSetting[2] + "\" name=\"absence_" + data.r_id + "\">欠席</button>");

        $("#leave" + r_id).attr("id", "leave" + data.r_id);
        $("#leave_mail_" + r_id).attr("id", "leave_mail_" + data.r_id);
        $("#providing" + r_id).attr("id", "providing" + data.r_id);
        //お弁当部分の書き換え
        //弁当のボタンを再作成
        //なんの弁当なのかを取得する
        $("#lunch" + r_id).attr("id", "lunch" + data.r_id);
        //お弁当の文字取得
        var lunchNo = $("#lunch" + data.r_id).data("lunchno");
        if (lunchNo != 0 && $("#lunch" + data.r_id).find("button").length) {
            var lunchTxt = $("#lunch" + data.r_id).find("button").text();
            $("#lunch" + data.r_id).html("<button class=\"btn btn-sm\" onclick=\"lunchFlg(" + data.r_id + "," + lunchNo + "," + c_id + "," + f_id + ",'" + date + "');\">" + lunchTxt + "</button>");
        }
        if ($("[id^=costfix-" + c_id + "]").length) {
            $("#providing" + data.r_id).closest("tr").find(".costRow > li").each(function (i, elem) {
                //ボタンの書き換えを行う
                var costIdData = $(elem).attr('data-costid');
                var costIdData = costIdData.split(',');
                $(elem).html("<button class=\"btn btn-sm btnFree \" onclick=\"actualCost(" + f_id + ",'" + date + "'," + c_id + "," + costIdData[0] + ",'" + data.r_id + "'," + costIdData[1] + "," + costIdData[3] + ");\">" + costIdData[2] + "</button>");
                $(elem).attr("id", "cost" + data.r_id + "_" + costIdData[0]);
            });
        }

        if (data.time_division) {
            $('.children' + r_id).find('.js_reason_note').html("<br>算定区分" + data.time_division);
        }
    }

    //欠席時対応加算Ⅱ関連の場合
    if ((data["type"] == 3) || (data["type"] == 4)) {
        $("#providing" + data.r_id).html("<b><span class=\"red js_attend_absence_two\">" + data["type_name"] + "</span></b>");
        //医ケアの基本報酬を算定しなくなるので、区分を非表示
        $(".children" + data.r_id).find(".medical_care_note").hide();
    } else if (data["type"] == 5) {
        $("#providing" + data.r_id).html("<b><span class=\"green\">基本報酬を算定する</span></b>");
    } else if (data["type"] == 9) {
        $("#providing" + data.r_id).html("<b><span class=\"green\">基本報酬を算定しない</span></b>");
    } else {
        $("#providing" + data.r_id).html("<b><span class=\"green\">" + data["type_name"] + "</span></b>");

        //
        if ($('.js_utilization_time').length) {
            $(".children" + data.r_id).data('providing_type', data["type"]);

            //
            if ($('#enter'+data.r_id).find('.green').length && $('#leave'+data.r_id).find('.green').length) {
                var enter = $('#enter'+data.r_id).find('.green').html();
                var leave = $('#leave'+data.r_id).find('.green').html();
                var enter_ary = enter.split(':');
                var leave_ary = leave.split(':');
                var s_hour = enter_ary[0];
                var s_min = enter_ary[1];
                var e_hour = leave_ary[0];
                var e_min = leave_ary[1];

                var diff_check_time = checkAttendanceDiffTime(date, s_hour, s_min, e_hour, e_min);
                var time_division = getTimeDivision(diff_check_time);
                var use_services = $('.children'+data.r_id).find('.realname').data('use_services');
                var providing_type = $('.children'+data.r_id).data('providing_type');
                if (use_services == 1 && data["type"] == 1) {
                    if (time_division == 3) {
                        time_division = 2;
                    }
                }

                if (data.time_division) {
                    $('.children' + r_id).find('.js_reason_note').html("<br>算定区分" + data.time_division);
                }
            }

        }
    }

    if (data.id) {
        $("#atnd" + data.r_id).html("<button class=\"btn btn-sm edit\" onclick=\"location.href='attendance.php?mode=edit&id=" + data.id + "&s_id=" + data.use_services + "'\">編集</button>");
    }
    return;
}


/**
 * 利用サービス、予約ID、提供形態に基づいて計画時間データを取得する関数
 *
 * @param {string} use_services - 利用サービス
 * @param {string} rid - 予約ID
 * @param {string} providing_type - 提供形態
 *
 * @returns {Object} 計画区分、計画時間（分単位）、計画時間（何時間何分）を含むオブジェクト
 */
function getPlanTimeData(use_services, rid, providing_type) {
    let children_element = $(`.children${rid}`);
    let plantime_div = null;
    let plantime_minute = null;
    let plantime_name = '';

    if (use_services === AFTER_SCHOOL_DAY_CARE) {
        // 放課後の場合
        if (providing_type === PROVIDING_AFTER_SCHOOL) {
            plantime_div = parseInt(children_element.data('plan_time1_div'), 10);
            plantime_name = children_element.data('plan_time1_name');
            plantime_minute = parseInt(children_element.data('plan_time1_minute'), 10);
        // 学休日の場合
        } else if (providing_type === PROVIDING_SCHOOL_HOLIDAYS) {
            plantime_div = parseInt(children_element.data('plan_time2_div'), 10);
            plantime_name = children_element.data('plan_time2_name');
            plantime_minute = parseInt(children_element.data('plan_time2_minute'), 10);
        }
    } else if (use_services === CHILD_DEVELOPMENT_SUPPORT) {
        plantime_div = parseInt(children_element.data('plan_time_div'), 10);
        plantime_name = children_element.data('plan_time_name');
        plantime_minute = parseInt(children_element.data('plan_time_minute'), 10);
    }

    return {
        plantime_div: plantime_div,
        plantime_minute: plantime_minute,
        plantime_name: plantime_name
    };
}


/**
 * 弁当の状態を保存(一覧)
 * ごちゃごちゃになるので別php読み込み
 * @param r_id
 * @param flg
 * @param c_id
 * @param f_id
 * @param date
 */
function lunchFlg(r_id, flg, c_id, f_id, date) {
    var url = "./ajax/ajax_attendance_lunch.php";
    $.ajax({
        url: url,
        data: {
            "r_id": r_id,
            "flg": flg,
            "c_id": c_id,
            "f_id": f_id,
            "date": date
        },
        timeout: 3000,
        async: false,
        dataType: 'json',
        success: function (data) {
            Success_lunch(data, r_id, c_id, f_id, date);
        }
    });
    getCancelCount();
}


/**
 * お弁当登録成功後(一覧)
 * @param data
 * @param r_id
 * @param c_id
 * @param f_id
 * @param date
 */
function Success_lunch(data, r_id, c_id, f_id, date) {
    //r_idの生成が行われていない場合r_idにはfix文字列
    //まずr_idが仮のものをすべて変更する
    //r_idにfixが含まれている場合は対象
    //児童の固定曜日用
    if (String(r_id).match(/fix/)) {
        //入室のボタン等のonclickを入れ替え
        //キャンセル待ちに関する部分書き換え
        $("#atnd" + r_id).closest("tr").removeClass("children" + r_id).addClass("children" + data.r_id);
        //キャンセル待ちのデータ属性入れ替え
        $("#atnd" + r_id).closest("tr").find(".waitbtn").attr('data-rid', data.r_id + ',wait,' + c_id + ',' + f_id + ',' + date).text("キャンセル待ち");
        //入室退室
        $("#atnd" + r_id).attr("id", "atnd" + data.r_id);

        //data属性を取得し、各種設定を反映する
        $("#enter" + r_id).attr("id", "enter" + data.r_id);
        var cidSetting = $("#enter" + data.r_id).data("cidsetting");
        $("#enter" + data.r_id).html("<button class=\"btn btn-sm\" onclick=\"sendEnterMail(" + data.r_id + "," + cidSetting[0] + "," + c_id + "," + f_id + ",1," + cidSetting[1] + ",'" + date + "'," + cidSetting[2] + ");\">入室</button><button class=\"btn btn-sm jqeryui-absence\" id=\"absence_" + data.r_id + "_" + c_id + "_" + f_id + "_" + date + "_" + cidSetting[2] + "\" name=\"absence_" + data.r_id + "\">欠席</button>");

        $("#providing" + r_id).attr("id", "providing" + data.r_id);
        $("#providing" + data.r_id).html("<button class=\"btn btn-sm\" onclick=\"proViding(" + data.r_id + ",1," + c_id + "," + f_id + ",'" + date + "');\">放課後</button><button class=\"btn btn-sm\" onclick=\"proViding(" + data.r_id + ",2," + c_id + "," + f_id + ",'" + date + "');\">学休日</button>");
        $("#leave" + r_id).attr("id", "leave" + data.r_id);
        $("#leave_mail_" + r_id).attr("id", "leave_mail_" + data.r_id);
        $("#providing" + r_id).attr("id", "providing" + data.r_id);
        if ($("[id^=costfix-" + c_id + "]").length) {
            $("#providing" + data.r_id).closest("tr").find(".costRow > li").each(function (i, elem) {
                //ボタンの書き換えを行う
                var costIdData = $(elem).attr('data-costid');
                var costIdData = costIdData.split(',');
                $(elem).html("<button class=\"btn btn-sm btnFree \" onclick=\"actualCost(" + f_id + ",'" + date + "'," + c_id + "," + costIdData[0] + ",'" + data.r_id + "'," + costIdData[1] + "," + costIdData[3] + ");\">" + costIdData[2] + "</button>");
                $(elem).attr("id", "cost" + data.r_id + "_" + costIdData[0]);
            });
        }
        //お弁当部分の書き換え
        //弁当のボタンを再作成
        //なんの弁当なのかを取得する
        $("#lunch" + r_id).attr("id", "lunch" + data.r_id);
        //お弁当の文字取得
    }
    $("#lunch" + data.r_id).html("<b><span class=\"green\">" + data.lunch + "</span></b>");

    return;
}


/**
 * 食事提供加算の状態を保存(一覧)
 * @param flg
 * @param c_id
 * @param f_id
 * @param date
 */
function mealOfferFlg(flg, c_id, f_id, date) {
    var url = "./ajax/ajax_attendance_mealoffer.php";
    $.ajax({
        url: url,
        data: {
            "flg": flg,
            "c_id": c_id,
            "f_id": f_id,
            "date": date
        },
        timeout: 3000,
        async: false,
        dataType: 'json',
        success: function (data) {
            $("#meal" + c_id).html("<b><span class=\"green\">" + data.meal + "</span></b>");
        }
    });
    getCancelCount();
}


/**
 * 実費の保存(一覧)
 * 実費保存は別処理なので別php作成します
 * @param f_id
 * @param cal_date
 * @param c_id
 * @param cost_id
 * @param r_id
 * @param type
 * @param s_id
 */
function actualCost(f_id, cal_date, c_id, cost_id, r_id, type, s_id) {

    var url = "./ajax/ajax_attendance_cost.php";
    $.ajax({
        url: url,
        data: {
            "f_id": f_id,
            "cal_date": cal_date,
            "c_id": c_id,
            "cost_id": cost_id,
            "r_id": r_id,
            "type": type,
            "s_id": s_id
        },
        timeout: 3000,
        async: false,
        dataType: 'json',
        success: function (data) {
            Success_cost(data, r_id, c_id, f_id, cal_date, cost_id, s_id);
        }
    });

    getCancelCount();
}


/**
 * 実費登録成功後(一覧)
 * @param data
 * @param r_id
 * @param c_id
 * @param f_id
 * @param date
 * @param cost_id
 * @param s_id
 */
function Success_cost(data, r_id, c_id, f_id, date, cost_id, s_id) {
    //r_idの生成が行われていない場合r_idにはfix文字列
    //まずr_idが仮のものをすべて変更する
    //r_idにfixが含まれている場合は対象
    //児童の固定曜日用
    if (String(r_id).match(/fix/)) {
        //入室のボタン等のonclickを入れ替え
        //キャンセル待ちに関する部分書き換え
        $("#atnd" + r_id).closest("tr").removeClass("children" + r_id).addClass("children" + data.r_id);
        //キャンセル待ちのデータ属性入れ替え
        $("#atnd" + r_id).closest("tr").find(".waitbtn").attr('data-rid', data.r_id + ',wait,' + c_id + ',' + f_id + ',' + date).text("キャンセル待ち");
        //入室退室
        $("#atnd" + r_id).attr("id", "atnd" + data.r_id);
        //data属性を取得し、各種設定を反映する
        $("#enter" + r_id).attr("id", "enter" + data.r_id);
        var cidSetting = $("#enter" + data.r_id).data("cidsetting");
        $("#enter" + data.r_id).html("<button class=\"btn btn-sm\" onclick=\"sendEnterMail(" + data.r_id + "," + cidSetting[0] + "," + c_id + "," + f_id + ",1," + cidSetting[1] + ",'" + date + "'," + cidSetting[2] + ");\">入室</button><button class=\"btn btn-sm jqeryui-absence\" id=\"absence_" + data.r_id + "_" + c_id + "_" + f_id + "_" + date + "_" + cidSetting[2] + "\" name=\"absence_" + data.r_id + "\">欠席</button>");
        $("#providing" + r_id).attr("id", "providing" + data.r_id);
        $("#providing" + data.r_id).html("<button class=\"btn btn-sm\" onclick=\"proViding(" + data.r_id + ",1," + c_id + "," + f_id + ",'" + date + "');\">放課後</button><button class=\"btn btn-sm\" onclick=\"proViding(" + data.r_id + ",2," + c_id + "," + f_id + ",'" + date + "');\">学休日</button>");
        $("#leave" + r_id).attr("id", "leave" + data.r_id);
        $("#leave_mail_" + r_id).attr("id", "leave_mail_" + data.r_id);
        $("#providing" + r_id).attr("id", "providing" + data.r_id);
        //お弁当部分の書き換え
        //弁当のボタンを再作成
        //なんの弁当なのかを取得する
        $("#lunch" + r_id).attr("id", "lunch" + data.r_id);
        // 実費項目の書き換え
        if ($("[id^=costfix-" + c_id + "]").length) {
            $("#providing" + data.r_id).closest("tr").find(".costRow > li").each(function (i, elem) {
                //ボタンの書き換えを行う
                var costIdData = $(elem).attr('data-costid');
                var costIdData = costIdData.split(',');
                $(elem).html("<button class=\"btn btn-sm btnFree \" onclick=\"actualCost(" + f_id + ",'" + date + "'," + c_id + "," + costIdData[0] + ",'" + data.r_id + "'," + costIdData[1] + "," + costIdData[3] + ");\">" + costIdData[2] + "</button>");
                $(elem).attr("id", "cost" + data.r_id + "_" + costIdData[3] + "_" + costIdData[0]);
            });
        }
        // 実費エリア
        $("#cost_area" + r_id).attr("id", "cost_area" + data.r_id);
    }

    $("#cost" + data.r_id + "_" + s_id + "_" + cost_id).html("<b><span class=\"green\">" + data.sumi + "</span></b>");
    $("#cost" + data.r_id + "_" + s_id + "_" + cost_id).attr('class', 'clicked');

    if (data.id) {
        // 保育所等訪問支援の場合
        if (s_id == "4") {
            $("#hoiku_atnd" + data.r_id).html("<button class=\"btn btn-sm edit\" onclick=\"location.href='attendance.php?mode=hoiku_edit&id=" + data.id + "&s_id=" + s_id + "'\">編集</button>");
            // 相談支援の場合
        } else if (s_id == "7") {
            $("#con_atnd" + data.r_id).html("<button class=\"btn btn-sm edit\" onclick=\"location.href='attendance.php?mode=con_edit&id=" + data.id + "&s_id=" + s_id + "'\">編集</button>");
            // 計画相談支援の場合
        } else if (s_id == "9") {
            $("#plan_con_atnd" + data.r_id).html("<button class=\"btn btn-sm edit\" onclick=\"location.href='attendance.php?mode=plan_con_edit&id=" + data.id + "&s_id=" + s_id + "'\">編集</button>");
            // 放デイ児発の場合
        } else {
            $("#atnd" + data.r_id).html("<button class=\"btn btn-sm edit\" onclick=\"location.href='attendance.php?mode=edit&id=" + data.id + "&s_id=" + s_id + "'\">編集</button>");
        }
    }

    return;
}


/**
 * 予約情報の削除確認関数(申し込み削除)
 * @param url
 * @param mode
 * @param id
 * @param c_id
 * @param date
 * @param f_id
 * @param fixed_setting
 */
function deleteReserveConfirm(url, mode, id, c_id, date, f_id, s_id, fixed_setting) {

    //繰り返し予定あるかつ残りの予定が一つの場合
    if (fixed_setting == 1) {
        //$('#fixed_setting').dialog('open');
        $('#fixed_setting').dialog({
            width: size,

            modal: true,
            resizable: false,
            draggable: false,
            hide: "fade",
            buttons: [
                {
                    text: '反映して保存',
                    click: function () {
                        location.href = './' + url + '?mode=' + mode + '&id=' + id + '&c_id=' + c_id + '&date=' + date + '&f_id=' + f_id + '&s_id=' + s_id + "&no_fixed_setting=2";
                        $(this).dialog("close");
                    }
                },
                {
                    text: '反映せずに保存',
                    click: function () {
                        location.href = './' + url + '?mode=' + mode + '&id=' + id + '&c_id=' + c_id + '&date=' + date + '&f_id=' + f_id + '&s_id=' + s_id + "&no_fixed_setting=1";
                        $(this).dialog("close");
                    }
                },
                {
                    text: 'キャンセル',
                    click: function () {
                        $(this).dialog("close");
                    }
                }
            ]
        });
        return false;
    } else {
        if (window.confirm('予約申し込みを削除してよろしいですか？\n※実績や実費、送迎の情報が存在する場合、一緒に削除されます。')) {
            location.href = './' + url + '?mode=' + mode + '&id=' + id + '&c_id=' + c_id + '&date=' + date + '&f_id=' + f_id + '&s_id=' + s_id;
        } else {
            return false;
        }
    }

}


/**
 * 保育所予約情報の削除確認関数(申し込み削除)
 * @param url
 * @param mode
 * @param id
 */
function HoikudeleteReserveConfirm(url, mode, id) {
    if (window.confirm('予約申し込みを削除してよろしいですか？')) {
        location.href = './' + url + '?mode=' + mode + '&id=' + id;
    } else {
        return false;
    }
}


/**
 * 児童名が選択されたら迎え送り場所のプルダウンの中身変更(編集)
 * @param c_id
 */
function comboBoxPlaceList(c_id, date, f_id) {
    var url = "./ajax/ajax_place.php?key=" + c_id + "&date=" + date + "&f_id=" + f_id;
    var use_services = "";

    //プルダウンが初期値ならエラーを削除して戻す
    if (c_id == 0) {
        $('#name_list').parent().find(".err,br").remove();

        // // お弁当欄も表示変更
        // $(".js_lunch").show();
        // $(".js_lunch_no").hide();

        return false;
    }

    // その他のテキストボックスを非表示
    $("[name='text_place_start']").hide();
    $("[name='text_place_end']").hide();

    $.ajax({
        type: 'post',
        url: url,
        timeout: 3000,
        async: false,
        dataType: 'json',
        success: function (json) {
            //一度プルダウン内を全削除
            $('#place_start > option').remove();
            $('#place_end > option').remove();
            //新しい値をセット
            if (json.place) {
                use_services = json.use_services;
                Object.keys(json.place).forEach(function (key) {
                    var val = this[key];
                    //土曜日または日曜日ならば自宅がデフォルト
                    if ($("#js_week").val() == 6 || $("#js_week").val() == 0) {
                        if (key == 2) {
                            $('#place_start').append($('<option>').html(val).val(key).attr("selected", "selected"));
                        } else {
                            $('#place_start').append($('<option>').html(val).val(key));
                        }
                    } else {
                        if (key == 1) {
                            $('#place_start').append($('<option>').html(val).val(key).attr("selected", "selected"));
                        } else {
                            $('#place_start').append($('<option>').html(val).val(key));
                        }
                    }

                    if (key == 2) {
                        $('#place_end').append($('<option>').html(val).val(key).attr("selected", "selected"));
                    } else {
                        $('#place_end').append($('<option>').html(val).val(key));
                    }
                }, json.place);
                $('#name_list').parent().find(".err,br").remove();
            } else {
                //受給者証がない児童は送迎場所のプルダウンは初期にして児童名の上にエラーを出す
                $('#name_list').parent().find(".err,br").remove();
                var val = {
                    1: '学校',
                    2: '自宅',
                    3: 'その他'
                };
                var c_id = $('#name_list').val();
                var name = $("#name_list option:selected").text();
                var html = '<span class="err">' + name + 'さんの受給者証情報がありません<br>受給者証を登録する際は、<a href="./recipient_list.php?mode=list&c_id=' + c_id + '">こちら</a>で登録してください</span><br>';
                $('#name_list').parent().prepend(html);
                $.each(val, function (key, value) {
                    if (key == 1) {
                        $('#place_start').append('<option id="' + key + '" selected="selected">' + value + "</option>");
                    } else {
                        $('#place_start').append('<option id="' + key + '">' + value + "</option>");
                    }
                    if (key == 2) {
                        $('#place_end').append('<option id="' + key + '" selected="selected">' + value + "</option>");
                    } else {
                        $('#place_end').append('<option id="' + key + '">' + value + "</option>");
                    }
                });
            }
            if (json.is_lunch == true) {
                $(".js-lunch").show();
            } else {
                $(".js-lunch").hide();
                $(".js-lunch").find("[name='lunch']").val(0);
            }

            // お弁当の初期値設定
            $("[name='lunch_no']").val(json.lunch_no);

        },
        error: function () {
            alert("通信に失敗しました。");
        }
    });
    // 提供サービスをもとに実費の表示を変更
    if (!use_services) {
        use_services = 1;
    }
    $("[class^='cost_area']").hide(); // 全サービス分非表示にする
    $(".cost_area" + use_services).show(); // 対象サービスの実費のみ表示

    // 児童が選択されていたらお弁当欄を表示する
    $(".js_lunch").hide();
    $(".js_lunch_check").show();

    if ($("input[name='lunch_flg']:checked").val() == "1") {
        $(".js_lunch_no").show();
    } else {
        $(".js_lunch_no").hide();
    }
}


//2016/12/21追記
//キャンセル待に移行するJS
/*
 方針
 1.キャンセル待をおしたらr_idを取得する
 2.modeとidをわたす(phpファイルを一つにしたいので)
 3.update処理をして成功したときに、該当児童のテーブル(tr)をキャンセル児童の一番上に移動する
 */

$(function () {
    //キャンセル待ちを押した場合
    $(document).on("click", ".waitbtn", (function () {
        //data属性取得
        var tmp = $(this).attr('data-rid');
        var tmp = tmp.split(',');
        var url = "./ajax/ajax_reserve_manage_setwait.php";
        //idを１時的に付与
        $(this).attr("id", "id" + tmp[0]);
        // var windwow_width = $(window).width();
        // //画面の幅取得
        // if (windwow_width <= 768) {
        //     //クラスを付与する
        //     $(".pinned > .pick").find("tbody").addClass("js_pick_pinned").removeAttr("id");
        //     $(".pinned > .send").find("tbody").addClass("js_cansel_pinned").removeAttr("id");
        //
        //     $.ajax({
        //         url: url,
        //         data: {
        //             "id": tmp[0],
        //             "mode": tmp[1],
        //             "c_id": tmp[2],
        //             "f_id": tmp[3],
        //             "date": tmp[4]
        //         },
        //         timeout: 3000,
        //         async: false,
        //         dataType: 'json',
        //         success: function (data) {
        //             //データの書き換え処理
        //             if (String(tmp[0]).match(/fix/) && page_name == "attendance") {
        //                 //入室のボタン等のonclickを入れ替え
        //                 //キャンセル待ちに関する部分書き換え
        //                 $("#atnd" + tmp[0]).closest("tr").removeClass("children" + tmp[0]).addClass("children" + data[4]);
        //                 //キャンセル待ちのデータ属性入れ替え
        //                 $("#atnd" + tmp[0]).closest("tr").find(".waitbtn").attr('data-rid', data[4] + ',wait,' + tmp[2] + ',' + tmp[3] + ',' + tmp[4]).text("キャンセル待ち");
        //                 //入室退室
        //                 $("#atnd" + tmp[0]).attr("id", "atnd" + data[4]);
        //
        //                 //data属性を取得し、各種設定を反映する
        //                 $("#enter" + tmp[0]).attr("id", "enter" + data[4]);
        //                 var cidSetting = $("#enter" + data[4]).data("cidsetting");
        //                 $("#enter" + data[4]).html("<button class=\"btn btn-sm\" onclick=\"sendEnterMail(" + data[4] + "," + cidSetting[0] + "," + tmp[2] + "," + tmp[3] + ",1," + cidSetting[1] + ",'" + tmp[4] + "'," + cidSetting[2] + ");\">入室</button><button class=\"btn btn-sm jqeryui-absence\" id=\"absence_" + data[4] + "_" + tmp[2] + "_" + tmp[3] + "_" + tmp[4] + "_" + cidSetting[2] + "\" name=\"absence_" + data[4] + "\">欠席</button>");
        //                 $("#leave" + tmp[0]).attr("id", "leave" + data[4]);
        //                 $("#leave_mail_" + tmp[0]).attr("id", "leave_mail_" + data[4]);
        //                 $("#providing" + tmp[0]).attr("id", "providing" + data[4]);
        //                 $("#providing" + data[4]).html("<button class=\"btn btn-sm\" onclick=\"proViding(" + data[4] + ",1," + tmp[2] + "," + tmp[3] + ",'" + tmp[4] + "');\">放課後</button><button class=\"btn btn-sm\" onclick=\"proViding(" + data[4] + ",2," + tmp[2] + "," + tmp[3] + ",'" + tmp[4] + "');\">学休日</button>");
        //                 //お弁当部分の書き換え
        //                 //弁当のボタンを再作成
        //                 //なんの弁当なのかを取得する
        //                 $("#lunch" + tmp[0]).attr("id", "lunch" + data[4]);
        //                 //お弁当の文字取得
        //                 var lunchNo = $("#lunch" + data[4]).data("lunchno");
        //                 if (lunchNo != 0 && $("#lunch" + data[4]).find("button").length) {
        //                     var lunchTxt = $("#lunch" + data[4]).find("button").text();
        //                     $("#lunch" + data[4]).html("<button class=\"btn btn-sm\" onclick=\"lunchFlg(" + data[4] + "," + lunchNo + "," + tmp[2] + "," + tmp[3] + ",'" + tmp[4] + "');\">" + lunchTxt + "</button>");
        //                 }
        //                 //自分自身のIDの書き換え
        //                 $("#id" + tmp[0]).attr("id", "id" + data[4]);
        //                 if ($("[id^=costfix-" + tmp[2] + "]").length) {
        //                     $("#providing" + data[4]).closest("tr").find(".costRow > li").each(function (i, elem) {
        //                         //ボタンの書き換えを行う
        //                         var costIdData = $(elem).attr('data-costid');
        //                         var costIdData = costIdData.split(',');
        //                         $(elem).html("<button class=\"btn btn-sm btnFree \" onclick=\"actualCost(" + tmp[3] + "," + tmp[4] + "," + tmp[2] + "," + costIdData[0] + ",'" + data[4] + "'," + costIdData[1] + "," + costIdData[3] + ");\">" + costIdData[2] + "</button>");
        //                         $(elem).attr("id", "cost" + data[4] + "_" + costIdData[0]);
        //                     });
        //                 }
        //             }
        //             $("#id" + data[4]).attr('data-rid', data[4] + ',' + data[3] + ',' + tmp[2] + ',' + tmp[3] + ',' + tmp[4]).text(data[2]);
        //             $("#id" + data[4]).parent().parent().appendTo("#" + data[1]);
        //             //別テーブルも移動する
        //             if (data[1] == 'waittable') {
        //                 $(".js_pick_pinned").find('.children' + data[4]).appendTo('.js_cansel_pinned');
        //             } else {
        //                 $(".js_cansel_pinned").find('.children' + data[4]).appendTo('.js_pick_pinned');
        //             }
        //
        //             //ボタンのdidabldを削除する
        //             if (data[1] == "releasetable") {
        //                 $("#id" + data[4]).parent().parent().find("button").removeClass("disable");
        //             } else {
        //                 $("#id" + data[4]).parent().parent().find("button").addClass("disable");
        //                 $("#id" + data[4]).removeClass("disable");
        //                 $("#id" + data[4]).parent().parent().children("td:first").children("button").removeClass("disable");
        //             }
        //             //各idのtrの数取得
        //             var r_num = $(".js_pick_pinned > tr").length;
        //             var w_num = $(".js_cansel_pinned > tr").length;
        //             //どちらの移動にも関係なく番号を振り直す
        //             //trの数forして最初から振り直す
        //             var r_elm = '<tr><td id="r_none_data" class="r_none_data" colspan="14">データが存在しませんでした。</td></tr>';
        //             var w_elm = '<tr><td id="w_none_data" class="w_none_data" colspan="14">データが存在しませんでした。</td></tr>';
        //             if (r_num) {
        //                 $(".r_none_data").parent().remove();
        //                 for (var r = 1; r <= $(".js_pick_pinned > tr").length; r++) {
        //                     $(".js_pick_pinned > tr:nth-child(" + r + ") > th").text(r);
        //                 }
        //             } else {
        //                 $("#releasetable").append(r_elm);
        //             }
        //             if (w_num) {
        //                 $(".w_none_data").parent().remove();
        //                 for (var i = 1; i <= $(".js_cansel_pinned > tr").length; i++) {
        //                     $(".js_cansel_pinned > tr:nth-child(" + i + ") > th").text(i);
        //                 }
        //             } else {
        //                 $("#waittable").append(w_elm);
        //                 // $(".pinned").find('tbody').append(w_elm);
        //             }
        //
        //             //どちらの移動にも関係なくodd evenを振り直す
        //             //一度odd even class削除
        //             $("table > tbody > tr").removeClass("even").removeClass("odd");
        //             //再付与
        //             $(".js_pick_pinned > tr:nth-child(odd)").addClass("odd");
        //             $(".js_pick_pinned > tr:nth-child(even)").addClass("even");
        //             $(".js_cansel_pinned > tr:nth-child(odd)").addClass("odd");
        //             $(".js_cansel_pinned > tr:nth-child(even)").addClass("even");
        //             $("#releasetable > tr:nth-child(odd)").addClass("odd");
        //             $("#releasetable > tr:nth-child(even)").addClass("even");
        //             $("#waittable > tr:nth-child(odd)").addClass("odd");
        //             $("#waittable > tr:nth-child(even)").addClass("even");
        //             $("#releasetable").trigger("update"); //tablesorter.js使ってソートするためにこれ重要
        //             $("#waittable").trigger("update");
        //             getCancelCount();
        //         },
        //         error: function () {
        //             alert("通信に失敗しました。");
        //         }
        //     });
        // } else {
        $.ajax({
            url: url,
            data: {
                "id": tmp[0],
                "mode": tmp[1],
                "c_id": tmp[2],
                "f_id": tmp[3],
                "date": tmp[4]
            },
            timeout: 3000,
            async: false,
            dataType: 'json',
            success: function (data) {
                //データの書き換え処理
                if (String(tmp[0]).match(/fix/) && page_name == "attendance") {
                    //入室のボタン等のonclickを入れ替え
                    //キャンセル待ちに関する部分書き換え
                    $("#atnd" + tmp[0]).closest("tr").removeClass("children" + tmp[0]).addClass("children" + data[4]);
                    //キャンセル待ちのデータ属性入れ替え
                    $("#atnd" + tmp[0]).closest("tr").find(".waitbtn").attr('data-rid', data[4] + ',wait,' + tmp[2] + ',' + tmp[3] + ',' + tmp[4]).text("キャンセル待ち");
                    //入室退室
                    $("#atnd" + tmp[0]).attr("id", "atnd" + data[4]);

                    //data属性を取得し、各種設定を反映する
                    $("#enter" + tmp[0]).attr("id", "enter" + data[4]);
                    var cidSetting = $("#enter" + data[4]).data("cidsetting");
                    $("#enter" + data[4]).html("<button class=\"btn btn-sm\" onclick=\"sendEnterMail(" + data[4] + "," + cidSetting[0] + "," + tmp[2] + "," + tmp[3] + ",1," + cidSetting[1] + ",'" + tmp[4] + "'," + cidSetting[2] + ");\">入室</button><button class=\"btn btn-sm jqeryui-absence\" id=\"absence_" + data[4] + "_" + tmp[2] + "_" + tmp[3] + "_" + tmp[4] + "_" + cidSetting[2] + "\" name=\"absence_" + data[4] + "\">欠席</button>");
                    $("#leave" + tmp[0]).attr("id", "leave" + data[4]);
                    $("#leave_mail_" + tmp[0]).attr("id", "leave_mail_" + data[4]);
                    $("#providing" + tmp[0]).attr("id", "providing" + data[4]);
                    $("#providing" + data[4]).html("<button class=\"btn btn-sm\" onclick=\"proViding(" + data[4] + ",1," + tmp[2] + "," + tmp[3] + ",'" + tmp[4] + "');\">放課後</button><button class=\"btn btn-sm\" onclick=\"proViding(" + data[4] + ",2," + tmp[2] + "," + tmp[3] + ",'" + tmp[4] + "');\">学休日</button>");

                    //お弁当部分の書き換え
                    //弁当のボタンを再作成
                    //なんの弁当なのかを取得する
                    $("#lunch" + tmp[0]).attr("id", "lunch" + data[4]);
                    //お弁当の文字取得
                    var lunchNo = $("#lunch" + data[4]).data("lunchno");
                    if (lunchNo != 0 && $("#lunch" + data[4]).find("button").length) {
                        var lunchTxt = $("#lunch" + data[4]).find("button").text();
                        $("#lunch" + data[4]).html("<button class=\"btn btn-sm\" onclick=\"lunchFlg(" + data[4] + "," + lunchNo + "," + tmp[2] + "," + tmp[3] + ",'" + tmp[4] + "');\">" + lunchTxt + "</button>");
                    }
                    if ($("[id^=costfix-" + tmp[2] + "]").length) {
                        $("#providing" + data[4]).closest("tr").find(".costRow > li").each(function (i, elem) {
                            //ボタンの書き換えを行う
                            var costIdData = $(elem).attr('data-costid');
                            var costIdData = costIdData.split(',');
                            $(elem).html("<button class=\"btn btn-sm btnFree \" onclick=\"actualCost(" + tmp[3] + "," + tmp[4] + "," + tmp[2] + "," + costIdData[0] + ",'" + data[4] + "'," + costIdData[1] + "," + costIdData[3] + ");\">" + costIdData[2] + "</button>");
                            $(elem).attr("id", "cost" + data[4] + "_" + costIdData[0]);
                        });
                    }
                }

                //自分自身のIDの書き換え
                $("#id" + tmp[0]).attr("id", "id" + data[4]);
                if (String(tmp[0]).match(/fix/) && page_name == "reserve_manage") {
                    //編集ボタンの書き換え
                    $("#id" + tmp[0]).closest("tr").find(".reservManageFixed").html('<button class="btn btn-sm edit" onclick="location.href=\'reserve_manage.php?mode=edit&amp;f_id=' + tmp[3] + '&amp;date=' + tmp[4] + '&amp;id=' + data[4] + '&amp;c_id=' + tmp[3] + '\'">編集</button>')
                }

                $("#id" + data[4]).attr('data-rid', data[4] + ',' + data[3] + ',' + tmp[2] + ',' + tmp[3] + ',' + tmp[4]).text(data[2]);
                $("#id" + data[4]).parent().parent().appendTo("#" + data[1]);
                //ボタンのdidabldを削除する
                if (data[1] == "releasetable") {
                    $("#id" + data[4]).parent().parent().find("button").removeClass("disable");

                    // キャンセル待ちの情報取得
                    if ($('#cancel_adding_tbody').find('#js_adding_list' + data[4]).length) {
                        const cancel_adding_data = $('#cancel_adding_tbody').find('#js_adding_list' + data[4]);
                        // 表示テーブルに移動して、キャンセル待ちテーブルから削除する
                        $('.js_adding_table').append(cancel_adding_data);
                        $('#cancel_adding_tbody').find('#js_adding_list' + data[4]).remove();
                    }

                } else {
                    $("#id" + data[4]).parent().parent().find("button").addClass("disable");
                    $("#id" + data[4]).removeClass("disable");
                    $("#id" + data[4]).parent().parent().children("td:first").children("button").removeClass("disable");

                    // 利用実績の情報取得
                    if ($('.js_adding_table').find('#js_adding_list' + data[4]).length) {
                        const display_adding_data = $('.js_adding_table').find('#js_adding_list' + data[4]);
                        // 表示テーブルに移動して、利用実績テーブルから削除する
                        $('#cancel_adding_tbody').find('table').append(display_adding_data);
                        $('.js_adding_table').find('#js_adding_list' + data[4]).remove();
                    }

                }
                //各idのtrの数取得
                var r_num = $("#releasetable > tr").length;
                var w_num = $("#waittable > tr").length;
                //どちらの移動にも関係なく番号を振り直す
                //trの数forして最初から振り直す
                var r_elm = '<tr><td id="r_none_data" colspan="15">データが存在しませんでした。</td></tr>';
                var w_elm = '<tr><td id="w_none_data" colspan="15">データが存在しませんでした。</td></tr>';
                if (r_num) {
                    $("#r_none_data").parent().remove();
                    for (var r = 1; r <= $("#releasetable > tr").length; r++) {
                        $("#releasetable > tr:nth-child(" + r + ") > th").text(r);
                    }
                } else {
                    $("#releasetable").append(r_elm);
                }
                if (w_num) {
                    $("#w_none_data").parent().remove();
                    for (var i = 1; i <= $("#waittable > tr").length; i++) {
                        $("#waittable > tr:nth-child(" + i + ") > th").text(i);
                    }
                } else {
                    $("#waittable").append(w_elm);
                }

                //どちらの移動にも関係なくodd evenを振り直す
                //一度odd even class削除
                $("table > tbody > tr").removeClass("even").removeClass("odd");
                //再付与
                $("#releasetable > tr:nth-child(odd)").addClass("odd");
                $("#releasetable > tr:nth-child(even)").addClass("even");
                $("#waittable > tr:nth-child(odd)").addClass("odd");
                $("#waittable > tr:nth-child(even)").addClass("even");
                $("#releasetable").trigger("update"); //tablesorter.js使ってソートするためにこれ重要
                $("#waittable").trigger("update");
                getCancelCount();
            },
            error: function () {
                alert("通信に失敗しました。");
            }
        });
        // }
    }));
});


/**
 * 各実績情報のカウント集計(各画面)
 */
function getCancelCount() {
    //キャンセル待のテーブルのiterationの数を取得する
    //trだとデータないのもカウントされるので
    const num = $("#waittable").find('.iteration').length;

    //キャンセル待ち以外で体験児童がいるかチェック
    const experience_cnt = $(".sortTable01").find('.experience').length;
    //欠席時対応加算Ⅰを取っている児童のカウント(体験の人数を引く)
    let absence_add = $("#releasetable").find('.js_attend_absenceflg2').length;
    //体験で欠席時対応加算Ⅰを取っている児童を取得する
    const ex_absence_add = $(".experience").find('.enter').find('.red .js_attend_absenceflg2').length;
    absence_add = absence_add - ex_absence_add;

    //欠席時対応加算なし欠席のカウント
    let absence_non_add = $("#releasetable").find('.js_attend_absenceflg3').length;
    //体験で欠席時対応加算なし欠席の人取得する
    const ex_absence_non_add = $(".experience").find('.enter').find('.red .js_attend_absenceflg3').length;
    absence_non_add = absence_non_add - ex_absence_non_add;

    const absence_two_count = $("#releasetable").find('.js_attend_absence_two').length;

    //出席の数カウント
    let attend = $("#releasetable").find('.enter').find(".green").length;
    //体験で出席を取得
    const ex_attend = $(".experience").find('.enter').find(".green").length;
    attend = attend - ex_attend - absence_two_count;
    //未登録人数
    let all_re_num = $("#releasetable").find('.iteration').length;
    const ex_all_re_num = $(".experience").find('.iteration').length;
    all_re_num = all_re_num - ex_all_re_num;
    const non_data = parseInt(all_re_num) - parseInt(absence_add) - parseInt(absence_non_add) - parseInt(attend) - parseInt(absence_two_count);
    if (experience_cnt > 0) {
        $(".js_experience_error").show();
    } else {
        $(".js_experience_error").hide();
    }

    $("#waitcount").text(num + '人');
    $("#absence").text(absence_add + '人');
    $("#js_no_addition").text(absence_non_add + '人');
    $("#attend").text(attend + '人');
    $("#no_data").text(non_data + '人');
    $("#experi").text(experience_cnt + '人');
    $("#absence_two").text(absence_two_count + '人');
}


/**
 * 保育所各実績情報のカウント集計(各画面)
 */
function getCancelCountHoiku() {
    //キャンセル待のテーブルのiterationの数を取得する
    //trだとデータないのもカウントされるので
    //欠席のカウント(体験の人数を引く)
    var ketu = $("#releasetable_hoiku").find('.red').length;
    //出席の数カウント
    var attend_hoikku = $("#releasetable_hoiku").find('.hoiku_enter').find(".green").length;
    //未登録人数
    var base_data = $("#releasetable_hoiku").find('.iteration').length;
    var non_data = parseInt(base_data) - parseInt(ketu) - parseInt(attend_hoikku);

    $("#attend_hoiku").text(attend_hoikku + '人');
    $("#absence_hoiku").text(ketu + '人');
    $("#no_data_hoiku").text(non_data + '人');
}


/**
 * 相談支援各実績情報のカウント集計(各画面)
 */
function getCancelCountConsul() {
    //キャンセル待のテーブルのiterationの数を取得する
    //trだとデータないのもカウントされるので
    //欠席のカウント(体験の人数を引く)
    var ketu = $("#releasetable_consul").find('.red').length;
    //出席の数カウント
    var attend_consul = $("#releasetable_consul").find('.consul_enter').find(".green").length;
    //未登録人数
    var base_data = $("#releasetable_consul").find('.iteration').length;
    var non_data = parseInt(base_data) - parseInt(ketu) - parseInt(attend_consul);

    $("#attend_consul").text(attend_consul + '人');
    $("#absence_consul").text(ketu + '人');
    $("#no_data_consul").text(non_data + '人');
}


/**
 * 送迎関連項目の表示を制御
 */
function changePickupDisabled() {
    var pickup_start = $("input[name='pickup_start']:checked").val();
    var pickup_end = $("input[name='pickup_end']:checked").val();
    // 迎えが無しの場合
    if (pickup_start != "1") {
        // 迎え場所とお迎え希望時間を表示しない
        $(".place_start_area").hide();
        $("[name='text_place_start']").hide();

        // 有りの場合
    } else {
        // 迎え場所とお迎え希望時間を表示する
        $(".place_start_area").show();

        if ($("[name='place_start']").val() != "3") {
            $("[name='text_place_start']").hide();
        } else {
            $("[name='text_place_start']").show();
        }
    }

    // 送りが無しの場合
    if (pickup_end != "1") {
        // 送り場所とお送り希望時間を表示しない
        $(".place_end_area").hide();
        $("[name='text_place_end']").hide();

        // 有りの場合
    } else {
        // 送り場所とお送り希望時間を表示する
        $(".place_end_area").show();

        if ($("[name='place_end']").val() != "3") {
            $("[name='text_place_end']").hide();
        } else {
            $("[name='text_place_end']").show();
        }
    }
}


/**
 * お弁当関連項目の表示を制御
 */
function changeLunchDisabled() {
    var lunch_flg = $("input[name='lunch_flg']:checked").val();

    // お弁当無しの時
    if (lunch_flg != "1") {
        $(".js_lunch_no").hide();

        // 有りの場合
    } else {
        $(".js_lunch_no").show();
    }
}


/**
 * お迎え希望時間が入った時、分がなかったら児童で00をセット
 */
function changeMukaeHour() {
    var hour = $("#mukae_hour").val();
    var min = $("#mukae_time").val();
    if (hour != 0 && min == 0) {
        $("#mukae_time").val(1);
    }
}


/**
 * 送り希望時間が入った時、分がなかったら児童で00をセット
 */
function changeOkuriHour() {
    var hour = $("#okuri_hour").val();
    var min = $("#okuri_time").val();
    if (hour != 0 && min == 0) {
        $("#okuri_time").val(1);
    }
}


/**
 * 左側のプルダウンが選択された時に、自動で右側のプルダウンに0を入れる処理
 */
$(function () {
    $(document).on('change', '.selecttime', function () {
        var hour = $(this).val();
        var min = $(this).next().val();
        if (hour && min == 0) {
            $(this).next().val(0);
        }

        var all_edit_flg = $("#js_all_edit_flg").length;

        //一括編集画面以外の場合
        if (all_edit_flg != 1 && !$(this).hasClass("js_adding_time")) {
            checkAttendanceTwo();
        }

        // 一括編集の保育所児童のテーブルの場合
        if ($(this).parent('td').hasClass('hoiku_enter')) {
            let trR_id = $(this).closest('tr').data('rid');
            let atMesseage = hour !== '' ? '出席' : '';
            // 開始時間(時)に値が変化したとき、加算実績テーブルの出欠席を更新
            $("#js_adding_atndinfo" + trR_id + "_hoiku").text(atMesseage);
        }

        var mode_check = $('[name=mode]').val();
        var id_check = $('[name=id]').val();

        // 保育所等訪問支援　かつ　初回の時
        if (mode_check == "hoiku_regist" && (!id_check || id_check == "insert")) {
            var hoikuspecialadd = $(this).data("hoikuspecialadd");

            // 訪問支援特別加算連動にチェックが入っている場合
            if (hoikuspecialadd == "1") {
                $('[name=houmon_special_add]').prop("checked", true);
            }

        }
    });
    $(document).on('change', '.selecttime2', function () {
        var hour = $(this).val();
        var min = $(this).next().val();
        if (hour && min == 0) {
            $(this).next().val(1);
        }
    });
});


// 出席表のレスポンシブ時にテーブルの高さを揃える
$(function () {
    $('.attendanceListTable td.realname').each(function () {
        var h = $(this).outerHeight();

        // var w = window.innerWidth;
        // if (w <= 768) {
        //     $(this).next().css({
        //         height: h + 16
        //     });
        // } else {
        $(this).next().removeAttr('style');
        // }
    });

    $(window).on('load resize scroll', function () {
        setAttendHeight();
    });
});


//関数化
function setAttendHeight() {
    // var w = window.innerWidth;
    // if (w <= 768) {
    //     var t_num = 0;
    //     //テーブルのカラム？の数取得
    //     $('.pinned .table td.realname').each(function () {
    //         t_num++;
    //     });
    //
    //     //半分の値を取得する
    //     var t_han_num = t_num / 2;
    //     //別のカウント変数準備
    //     var cnt = 0;
    //     var cnt_okuri = 0;
    //
    //     //trのカウント初期値
    //     var tr_cnt = 2;
    //
    //
    //     $('.pinned .table tr').each(function (index) {
    //
    //
    //         if (index > 1) {
    //
    //             var dom1 = $(this).closest("tr");
    //
    //             //高さを取得（小数点まで）
    //             var h = dom1[0].getBoundingClientRect().height;
    //
    //             //各TRの高さを取得（バラバラのため）
    //             var dom2 = $(".scrollable tr").eq(tr_cnt);
    //             var first_h = dom2[0].getBoundingClientRect().height;
    //             // var second_h = $(".scrollable tr").eq(tr_cnt+1).outerHeight(true);
    //
    //             if (h > first_h) {
    //                 $(".scrollable tr").eq(tr_cnt).height(h);
    //             } else {
    //                 $(this).closest("tr").height(first_h);
    //             }
    //
    //
    //             tr_cnt++;
    //         }
    //
    //         if (t_han_num >= cnt) {
    //             cnt++;
    //             $("div.ibox .pickTableWrap .scrollable table.responsive > tbody > tr:nth-child(" + cnt + ")").height(h);
    //         } else {
    //             cnt_okuri++;
    //             $("div.ibox .sendTableWrap .scrollable table.responsive > tbody > tr:nth-child(" + cnt_okuri + ")").height(h);
    //         }
    //     });
    // }
    //
    $('.scrollable .fs_list').each(function () {
        var header_h = $(this).height();
        if (header_h > 0 && $(this).closest('thead').next().find('.realname').length > 0) {
            $(this).closest('.scrollable').next().find('thead th.realname').height(header_h);
        }
    });
}


$(function () {
    $(window).on('load resize scroll', function () {
        var w = window.innerWidth;
        if (w >= 769) {
            // 関数にするとなぜか順番が動いてしまうので直書き
            $('.sortTable01 th.header').on('click touchstart', function () {
                setTimeout(function () {
                    $('.sortTable01 .iteration').each(function (num) {
                        if (num == 0) {
                            return true;
                        }
                        $(this).text(num);
                    });
                }, 1);
            });
            // 関数にするとなぜか順番が動いてしまうので直書き
            $('.sortTable02 th.header').on('click touchstart', function () {
                setTimeout(function () {
                    $('.sortTable02 .iteration').each(function (num) {
                        if (num == 0) {
                            return true;
                        }
                        $(this).text(num);
                    });
                }, 1);
            });
        } else {
            // // 別々のtableから連番するために関数化
            var $elm = $('.scrollable .sortTable01 th.header');
            var $index = $('.pinned .sortTable01 .iteration');
            attendanceSort($elm, $index);
            $('.scrollable .use_service.header').on('click touchstart', function () {
                // 隠れているpinnedの利用サービスソートも一緒にクリックさせる
                $('.pinned .use_service.header').trigger('click touchstart');
            });
        }
    });
});


/**
 * ソートするときに連番を維持するための関数
 * @param elm
 * @param index
 */
function attendanceSort(elm, index) {
    elm.on('click touchstart', function () {
        setTimeout(function () {
            index.each(function (num) {
                if (num == 0) {
                    return true;
                }
                $(this).text(num);
            });
        }, 1);
    });
}


// 出席表のレスポンシブ時にテーブルの高さを揃える
$(function () {
    $('.attendanceListTable3 td.realname3').each(function () {
        var h = $(this).outerHeight();
        // var w = window.innerWidth;
        // if (w <= 768) {
        //     $(this).next().css({
        //         height: h + 16
        //     });
        // } else {
        $(this).next().removeAttr('style');
        // }
    });
    $(window).on('load resize scroll', function () {

        var w = window.innerWidth;
        var t_num = 0;
        //テーブルのカラム？の数取得
        $('.pinned .table td.realname3').each(function () {
            t_num++;
        });
        //半分の値を取得する
        var t_han_num = t_num / 2;
        //別のカウント変数準備
        var cnt = 0;
        var cnt_okuri = 0;
        $('.pinned .table td.realname3').each(function () {
            var h = $(this).outerHeight();
            $(this).parent().height(h);

            if (t_han_num >= cnt) {
                cnt++;
                $("div.ibox .pickTableWrap3 .scrollable table.responsive > tbody > tr:nth-child(" + cnt + ")").height(h);
            } else {
                cnt_okuri++;
                $("div.ibox .sendTableWrap .scrollable table.responsive > tbody > tr:nth-child(" + cnt_okuri + ")").height(h);
            }
        });
    });
});


/**
 * 最終更新表示用の関数作成
 * @param data
 * @param r_id
 */
function update(data, r_id) {
    //最終更新の日付表示
    $("#leave" + r_id).parent().find('.updater').html(data);
}


/*
 プロトタイプで一部しか動かないので注意
 既に既に押してある実績をボタンに戻す
---------------------------*/
$(function () {
    $(document).on('click', '.enter a', function () {
        //idを取得する
        var id = getRid(this);
        var class_name = $(this).attr('class');
        if (class_name.match(/absence-off/)) {
            var absence_times = parseInt($(this).prev().attr('abs_times'));
        } else {
            var absence_times = parseInt($(this).prev().attr('abs_times')) - 1;
        }

        //要素が消えるのでここで取得処理
        var num = $(".scrollable tr").index($(this).closest("tr"));
        var elm = $(this).closest("tr");

        // HTMLが長いので変数を用意 ※フラグの値が固定値なのでシステム設置時に調整してください
        var month = getMonth();
        var html = '<input type="hidden" value="0" name="list[' + id + '][attend_flg]"><button class="btn btn-sm attend">出席</button> <button class="btn btn-sm absence-on js_absence-on-button" abs_times="' + absence_times + '">欠席（' + month + '月欠席' + absence_times + '回）</button> <button class="btn btn-sm absence-off js_absence_off">欠席（欠席時対応加算を取らない）</button>';
        $(this).parent().html(html);

        let meal_offer_flg = $('[name="list[' + id + '][meal_offer_flg]"]').val();　// 食事提供加算の対象児童なのかを取得
        let addingMealFlg = $('[name="list[' + id + '][adding_meal_flg]"]').val();　// 食事提供加算の連動機能有無を取得
        // 食事提供加算対象児童で、連動機能ある場合は「なし」を表示
        if ((addingMealFlg === '1') && (meal_offer_flg === '1')) {
            $("#meal" + id + " .meal_btn").show();
            $("#meal" + id + " b").hide();
        }

        //高さの調整
        $(elm).height(50);
        $(elm).next().height(50);
        //合成テーブルも高さ設定
        $('.pinned .table tr').eq(num).height(50);
        $('.pinned .table tr').eq(num + 1).height(50);
        return false;
    });

    // リセットボタン
    $('.reset button').on('click', function () {

        if (window.confirm('登録情報をリセットしてよろしいですか？')) {
            var r_id = getRid(this);
            elm = $(this);
            Success_all(elm, r_id, 1);
            //理由を入力するテキストエリアを削除
            $('[name="list[' + r_id + '][reason_text]"]').closest('td').remove();
            //表示が崩れるので調整
            // if (window.innerWidth <= 768) {
            //     setAttendHeight();
            // }
            // リセットボタンを押したら、算定理由を非表示
            $('[name="list[' + r_id + '][reason_staff]"]').parent('td').hide();

            var num = $(".reset button").index($(elm));
            //TRの順番を作成する
            var tr_cnt = (num + 1) * 2;
            //高さの再設定
            $(elm).closest("tr").height(50);
            $(elm).closest("tr").next().height(50);
            //合成テーブルも高さ設定

            $('.pinned .table tr').eq(tr_cnt).height(50);
            $('.pinned .table tr').eq(tr_cnt + 1).height(50);

            if ($('.js_law2024').val()) {
                $('.js_children_area'+r_id).find('.js_plantime_area').hide();
            }

            //連動分の加算を削除
            DeleteAddingRows(r_id)
        }
    });

    $(document).on('click', '.hoiku_enter a', function () {
        //idを取得する
        var id = getRid(this);
        // HTMLが長いので変数を用意 ※フラグの値が固定値なのでシステム設置時に調整してください
        var html = '<input type="hidden" value="0" name="hoiku_list[' + id + '][hoiku_attend_flg]"><button class="btn btn-sm hoiku_attend">開始</button><button class="btn btn-sm hoiku_absence-on">キャンセル</button>';
        $(this).parent().html(html);
        $("#js_adding_atndinfo" + id + "_hoiku").text(""); // 加算実績テーブルの出欠更新
        getCancelCountHoiku();
        return false;
    });

    //保育所リセット
    $('.hoiku_reset button').on('click', function () {
        if (window.confirm('登録情報をリセットしてよろしいですか？')) {
            var id = $(this).closest("tr").data("rid");
            $("#js_adding_atndinfo" + id + "_hoiku").text(""); // 加算実績テーブルの出欠更新
            resetHaneiHoiku(id, $(this).closest("tr"));

            //連動分の加算を削除
            if ($('.js_law2024').length) {
                DeleteAddingRows_hoiku(id);
            }
        }
    });
});


/**
 * 一括編集リセット処理
 * @param elm
 * @param r_id
 * @param reset_flg
 * @returns {boolean}
 */
function Success_all(elm, r_id, reset_flg) {
    var id = r_id;
    var absence_times = $("#absence_times" + id).val();

    //欠席時対応加算Ⅰ、Ⅱ関連をリセット
    $('[name="list[' + r_id + '][absence_click_count]"]').val(0);
    $('[name="list[' + r_id + '][absence_note]"]').val("");
    $('[name="list[' + r_id + '][absence_note_staff]"]').val(0);
    $('[name="list[' + r_id + '][absence_two_note]"]').val("");
    $('[name="list[' + r_id + '][absence_two_note_staff]"]').val(0);
    $('[name="list[' + r_id + '][absence_two_flg]"]').val(0);

    // 算定時間数をリセット
    $('[name="list[' + r_id + '][time_set]"]').val("");

    // HTMLが長いので変数を用意 ※フラグの値が固定値なのでシステム設置時に調整してください
    var month = getMonth();

    //利用時間があれば
    if ($('.js_law2024').val()) {
        var colspan = 6;
    } else {
        var colspan = 4;
    }

    var attend = '<td rowspan="2" class="enter" colspan="'+colspan+'" id="enter' + id + '"><input type="hidden" value="0" name="list[' + id + '][attend_flg]"><button class="btn btn-sm attend">出席</button> ' +
        '<button type="button" class="btn btn-sm absence-on js_absence-on-button" abs_times="' + absence_times + '">欠席（' + month + '月欠席' + absence_times + '回）</button> <button class="btn btn-sm absence-off js_absence_off">欠席（欠席時対応加算を取らない）</button></td>';

    // 実費
    var cost = '<ul class="costRow">';
    $(elm).closest('tr').find('.cost span').each(function () {
        var text = $(this).text();
        var val = $(this).data("costval");
        var s_id = $(this).data("sid");
        cost += '<li id="cost' + id + '_' + s_id + '_' + val + '"><label><input type="checkbox" name="list[' + id + '][cost][' + s_id + '][' + val + ']" value="' + val + '" class="checkBtn"><span class="btn btn-sm cost_type" data-costval="' + val + '" data-sid="' + s_id + '">' + text.replace(/済/g, "") + '</span></label></li> '
    });
    cost += '</ul>';

    // お弁当が無しかどうかを取得
    var lunchid = $('[name="list[' + id + '][lunch_flg]"]').val();
    var lunchTxt = $(elm).closest('tr').find(".alunch").text().replace(/\s+/g, '');
    if (lunchTxt != '無し') {
        lunchTxt = lunchTxt.replace(/提供済/g, '');
    }
    var lunch = '<input type="hidden" name="list[' + id + '][lunch_status]" value="0"><button type="button" class="btn btn-sm lunchbtn" value="' + lunchid + '">' + lunchTxt + '</button>';

    //食事提供加算が項目として表示されている場合
    if ($(".ameal").length) {
        var meal_id = $('[name="list[' + id + '][adding_meal_id]"]').val();
        var meal_Txt = $(elm).closest('tr').find(".ameal").text().replace(/\s+/g, '');
        var meal_btn_Txt; // 食事提供加算ボタン用のテキスト

        if (meal_Txt != '無し') {
            if ($('.js_law2024').val()) {
                var meal_html = '<button type="button" class="btn btn-sm meal_btn" value="1">加算（I）</button><button type="button" class="btn btn-sm meal_btn" value="2">加算（II）</button>';
            } else {
                meal_btn_Txt = meal_Txt.replace(/提供済/g, '').replace('無し', '');
                var meal_html = '<button type="button" class="btn btn-sm meal_btn" value="' + meal_id + '">' + meal_btn_Txt + '</button>';
            }
        }
        var meal = '<input type="hidden" name="list[' + id + '][adding_meal_id]" value="0">'+meal_html+'<b style="display: none">無し</b>';
    }

    // リセットボタンを押した時の挙動
    $(elm).closest("tr").find('.enter, .leave, .body_temp, .providing, .usetime, .time_division').remove(); // 入室時間から提供形態までのtdを削除
    $(elm).closest("tr").next().find('.js_under_division').hide(); //下の段の計画時間の理由を削除
    $('[name="list[' + id + '][reason_text]"]').closest(".tal").remove();

    if ($("[name=visible_event]:checked").val() == 1) {
        $(elm).closest("tr").find('.text-left').after(attend); // 利用サービスの後ろに出欠席のボタンを追加
    } else {
        $(elm).closest("tr").find('.fs_list').after(attend); // 利用サービスの後ろに出欠席のボタンを追加
    }

    //リセットフラグがある場合は実費・お弁当も初期化する
    if (reset_flg) {
        $(elm).parent().prevAll('.cost').html(cost); // 実費をボタンに変更
        if (lunchTxt != '無し') {
            $(elm).parent().prevAll('.alunch').html(lunch); // お弁当の提供済をボタンに変更
        }
        //食事提供加算が項目として表示されている場合
        if ($(".ameal").length) {
            if (meal_Txt != '無し') {
                $(elm).parent().prevAll('.ameal').html(meal); // お弁当の提供済をボタンに変更
            }
        }
        // hiddenの提供形態をリセット
        $('input:hidden[name="list[' + id + '][providing_type]"]').val("0");
        $('[name="list[' + id + '][time_division]"]').val(0);

        // hiddenの延長支援加算連動フラグをリセット（加算項目管理の編集権限無い場合の登録処理で使用するフラグ）
        $('[name="list[' + id + '][extension_calcu_flg]"]').val('');

        // 加算実績テーブルの出欠席表記をリセット
        $(`#js_adding_atndinfo${id}`).html('');

        //加算のリセット処理ここに書く
        DeleteAddingRows(id)
    } else {
        // 操作オプションの出欠席と入室時間を取得
        const attendVal = $('[name=attend_hanei]').val();
        const enterHourAll = $('#enter_hour_all').val();
        const attendS_hour = $('[name="list[' + id + '][s_hour]"]').val();

        // 出席フラグが立っており、且つ入室時間が入力されているときに実行
        if ((attendVal === '1' && enterHourAll != 9999　) || (attendVal === '1' && attendS_hour != '')) {
            $(`#js_adding_atndinfo${id}`).text("出席");
            updateAddingRows(id)
        }

    }
    getCancelCount();


    return false;
}


// 出欠席を押したときの挙動
$(function () {

    $(document).on('input', 'input[name*="time_set"]', function() {
        // 入力値を取得
        let input = $(this).val();

        // 全角数字、全角小数点、全角句読点を半角に変換
        input = input.replace(/[０-９．。]/g, function(s) {
            if (s === '。') return '.'; // 全角句読点は半角小数点に変換
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0); // それ以外は通常の全角から半角への変換
        });

        // 非数値文字を削除（小数点は許可）
        input = input.replace(/[^0-9.]/g, '');

        // 小数点以下2桁を許可するように正規表現で調整
        if (input.indexOf('.') !== -1) {
            let parts = input.split('.');
            parts[1] = parts[1].substr(0, 2); // 小数点以下2桁まで
            input = parts[0] + '.' + (parts[1] || ''); // 小数部がない場合のエラーを防ぐ
        }

        // 全体の長さを4文字に制限
        if (input.length > 4) {
            input = input.substr(0, 4);
        }

        // 変更した値を設定
        $(this).val(input);
    });

    // 欠席のHTMLを用意
    var month = getMonth();
    var absenceOnHTML = '<a href="#" class="enter red absence-on js_attend_absenceflg2"><b>欠席（' + month + '月欠席absence_times回）</b></a>',
        absenceOffHTML = '<a href="#" class="enter red absence-off js_attend_absenceflg3"><b>欠席（欠席時対応加算を取らない）</b></a>';
    //全てのベースとなるoptionの生成
    var hour_option = ""
    for (var i = -1; i < 24; i++) {
        if (i == -1) {
            hour_option += '<option value="">--</option>';
        } else {
            hour_option += '<option value="' + i + '">' + ('0' + i).slice(-2) + '</option>';
        }
    }
    var time_option = "";
    for (var i = -1; i < 60; i++) {
        if (i == -1) {
            time_option += '<option value="">--</option>';
        } else {
            time_option += '<option value="' + i + '">' + ('0' + i).slice(-2) + '</option>';
        }
    }
    //体温計
    var bodytmp_option = "";
    for (var i = 30; i < 43; i++) {
        if (i == 30) {
            bodytmp_option += '<option value="">--</option>';
        } else {
            bodytmp_option += '<option value="' + i + '">' + ('0' + i).slice(-2) + '</option>';
        }
    }
    var bodypoint_option = "";
    for (var i = -1; i < 10; i++) {
        if (i == -1) {
            bodypoint_option += '<option value="">--</option>';
        } else {
            bodypoint_option += '<option value="' + i + '">' + i + '</option>';
        }
    }

    // 出席を押した時(一括編集)
    $(document).on('click', '.attend', function () {
        //idを取得する
        var id = getRid(this);
        var use = $('[name="list[' + id + '][use_services]"]').val();
        //ココからtdを４つ作成する
        var td1_1 = '<td rowspan="2" class="enter" id="enter' + id + '"><input type="hidden" class ="green" value="1" name="list[' + id + '][attend_flg]"><select name="list[' + id + '][s_hour]" class="selecttime js_attend_time">' + hour_option + '</select>： ';
        var td1_2 = '<select name="list[' + id + '][s_min]" class="js_attend_time">' + time_option + '</select></td>';
        var td2_1 = '<td rowspan="2" class="leave"><select name="list[' + id + '][e_hour]" class="selecttime js_attend_time">' + hour_option + '</select>： ';
        var td2_2 = '<select name="list[' + id + '][e_min]" class="js_attend_time">' + time_option + '</select></td>';
        //体温
        var td3_1 = '<td rowspan="2" class="body_temp"><select name="list[' + id + '][body_temp]" class="selecttime">' + bodytmp_option + '</select>. ';
        var td3_2 = '<select name="list[' + id + '][body_temp_point]">' + bodypoint_option + '</select>℃</td>';

        var td_time = '';
        let bulkEditProvidingClass = "";
        if ($('.js_law2024').val()) {
            // 重心施設・重心児童の場合は表示されないので分岐する
            if ($('.js_children_area' + id).find('.js_plantime_base').length) {
                var plantime_html = $('.js_children_area' + id).find('.js_plantime_base').html();
                td_time = '<td rowspan="2" class="usetime"><span class="js_utilization_time"></span>'+plantime_html+'</td>';
            } else {
                td_time = '<td rowspan="2" class="usetime"><span class="js_utilization_time"></span></td>';
            }
            bulkEditProvidingClass = "js_bulk_edit_providing";
        }

        //利用サービスが放課後等デイサービスの場合
        if (use != 2) {
            var td4 = '<td rowspan="2" class="providing" id="providing' + id + '"><label><input type="radio" name="list[' + id + '][providing_type]" value="1" class="radioBtn '+ bulkEditProvidingClass + '"><span class="btn btn-sm">放課後</span></label> <label><input type="radio" name="list[' + id + '][providing_type]" value="2" class="radioBtn '+ bulkEditProvidingClass + '" ><span class="btn btn-sm">学休日</span></label></td>';
        } else {
            var td4 = '<td rowspan="2" class="providing" id="providing' + id + '"></td>';
        }
        let td5 = '';
        let under_td5 = '';

        if ( $('[name="list[' + id +'][symbiotic_flg]"]').val() != 0 || $('[name="list[' + id +'][severe_only_flg]"]').val() != 0) {
            td5 = '<td class="time_division"></td>';
            under_td5 = '<td class="noStyle js_under_division js_severe_only"></td>';

        } else {
            td5 = '<td class="time_division">' +
                '<select name="list[' + id + '][time_division]" class="js_' + id + '_time_division">' +
                '<option value="0" >---</option>' +
                '<option value="1" >区分１</option>' +
                '<option value="2" >区分２</option>' +
                '<option value="3" >区分３</option>' +
                '</select></td>';

            under_td5 = $(this).closest('tr').next().find('.js_under_division').clone();
        }

        $(this).parent().parent().children('.enter').after(td1_1 + td1_2 + td2_1 + td2_2 + td3_1 + td3_2 + td_time + td4 +td5);

        if ( $('[name="list[' + id +'][symbiotic_flg]"]').val() != 0 || $('[name="list[' + id +'][severe_only_flg]"]').val() != 0) {
            $(this).closest('tr').next().find('.js_under_division').show();
        } else {
            if ($('[name="list[' + id +'][reason_staff]"]').length) {
                $('[name="list[' + id +'][reason_staff]"]').parent('td').show();
            } else {
                $(this).closest('tr').next().prepend(under_td5);
            }
        }

        $(this).parent().remove();


        getCancelCount();
    });

    //入退室時間を変更した場合(一括編集)
    $(document).on('change', '.js_attend_time', function (event) {

        // js_attend_timeがchangeした履歴を残す(providing_typeをトリガーでclickしている。イベントが発生元がjs_attend_timeの場合は一部処理を通したくないので、ここでフラグを立てる)
        jsAttendTimeChanged = true;

        //初期化
        var before_data_flg = 0;

        //idを取得する
        var id = getRid(this);

        var select_val = $(this).val();
        //利用サービス
        let use_services = parseInt($(`[name="list[${id}][use_services]"]`).val());

        var extension_time_plan_flg = $('[name="list[' + id + '][extension_time_plan_flg]"]').val();

        // 入室時間
        let check_hour = $('[name="list[' + id + '][s_hour]"]').val();

        let addingMealVal = $(this).closest('tr').find('.ameal input[name="list[' + id + '][adding_meal_id]"]').val();　// 食事提供加算の値を取得
        let addingMealFlg = $(this).closest('tbody').find('input[name="list[' + id + '][adding_meal_flg]"]').val();　// 食事提供加算の連動機能有無を取得

        let child_id = $(`[name="list[${id}][c_id]"]`).val();

        var select_date = $("[name=date]").val();
        var select_date_ary = select_date.split('-');
        var s_hour = $('[name="list[' + id + '][s_hour]"]').val();
        var s_min = $('[name="list[' + id + '][s_min]"]').val();
        var e_hour = $('[name="list[' + id + '][e_hour]"]').val();
        var e_min = $('[name="list[' + id + '][e_min]"]').val();
        var f_id = $('[name="list[' + id + '][f_id]"]').val();
        var providing_type = parseInt($(this).closest('tr').find('.providingChecked').val());
        var startDate = new Date(select_date_ary[0], select_date_ary[1] - 1, select_date_ary[2], 0, 0, 0);
        var checkDate = new Date(2021, 3, 1, 0, 0, 0);
        var checkDate_2024 = new Date(2024, 3, 1, 0, 0, 0);

        var diff_check_time = checkAttendanceDiffTime(select_date, s_hour, s_min, e_hour, e_min);

        // 児発の場合
        if (use_services == 2 && startDate < checkDate_2024) {
            // 加算の連動機能は入室時間が選択された時点で実行
            if (check_hour) {
                // 加算実績テーブルの出欠席更新
                $(`#js_adding_atndinfo${id}`).text("出席");
                //加算の連動処理
                updateAddingRows(id);

                // 食事提供加算用の処理
                if ((addingMealFlg === '1') && (addingMealVal === '0')) {
                    // 食事提供加算未登録で、連動機能ある場合はボタンを押下状態へ変更
                    $(this).closest('tr').find(".ameal .meal_btn").trigger('click');
                }


            } else {
                // 入室時間が未選択の場合は連動加算をリセット
                $(`#js_adding_atndinfo${id}`).text("");
                // 加算の連動加算リセット処理
                DeleteAddingRows(id)

                // 食事提供加算用の処理
                if ((addingMealFlg === '1') && (addingMealVal === '1')) {
                    // 食事提供加算登録済みで、連動機能ある場合はボタンを押下状態を解除
                    $(this).closest('tr').find(".ameal .meal_btn").trigger('click');
                }

            }

            return false;
        } else {

            //選択したname属性を取得するため、不要な文字列を削除して判定用文字列name取得
            var this_name = $(this).attr("name");
            this_name = this_name.replace(/\[/g, '').replace(/\]/g, '').replace(/list/g, '').replace(id, '');

            //4/1以降の場合
            if (startDate >= checkDate) {

                $("#providing" + id).find('.js_absence-two-button').remove();

                //30分未満の場合
                if ((diff_check_time < 30) && (diff_check_time != null)) {

                    $(`.js_children_area${id}`).find('.js_plantime_area:last').hide();

                    //令和６年法改正前
                    if (startDate < checkDate_2024) {

                        //ハイライト追加
                        $(this).closest('tr').find(".providing").addClass("thirtyTime");

                        //提供形態がチェックされている場合
                        if ($("#providing" + id).find(".providingChecked").length) {

                            var providing_reset_html = '';
                            //提供形態をリセットする
                            providing_reset_html = '<span class="db lh2 js_providing_reset"><a href="#" class="enter green"><b>提供形態をリセット</b></a></span>';

                            //入室退室時間を変更した場合、提供形態をリセット
                            providing_type = null;

                            $(`.js_children_area${id}`).find('.js_plantime_area').remove().end();

                            $("#providing" + id).find(".js_providing_reset").remove().end()
                                .append(providing_reset_html);

                        } else {
                            //複数表示しないため、存在チェック
                            if (!$("#providing" + id).find('.js_absence-two-button,.js_absence-two-on,.js_absence-two-off').length) {

                                var absence_two_html = '';
                                var absence_two_html = ' <button class="btn btn-sm js_absence-two-button">欠席時対応加算Ⅱ</button>';

                                $("#providing" + id).html('<button class="btn btn-sm js_regular_reward-button">基本報酬を算定する</button> ' + absence_two_html);
                            }
                        }
                    }else{

                        //ハイライト追加
                        $(this).closest('tr').find(".js_utilization_time").parent().addClass("thirtyTime");

                        //算定のプルダウンを非表示
                        $(`.js_children_area${id}`).find('.js_plantime_area:last').hide();

                        let btn1 = '';

                        //一括編集画面で使用(操作オプション、一括反映のとき)放デイの場合
                        if (use_services == 1) {

                            //入室退室時間を変更した場合、提供形態をリセット
                            providing_type = null;

                            // 非表示の提供形態の値もリセット
                            $('input:hidden[name="list[' + id + '][providing_type]"]').val('0');

                            btn1 = '<button class="btn btn-sm js_regular_reward-button">基本報酬を算定する</button>';

                        }else{
                            //児童発達支援の場合
                            btn1 = '<label><input type="radio" name="list[' + id + '][providing_type]" value="5" class="radioBtn"><span class="btn btn-sm">基本報酬を算定する</span></label>';
                        }

                        let btn2 = '<label><input type="radio" name="list[' + id + '][providing_type]" value="9" class="radioBtn"><span class="btn btn-sm">基本報酬を算定しない</span></label>';

                        $("#providing" + id).html(btn1 + btn2);

                    }

                } else {

                    //提供形態設定
                    const bulkEditProvidingBaseClass = 'js_bulk_edit_providing';
                    let bulkEditProvidingAfterSchoolClass = bulkEditProvidingBaseClass;
                    let bulkEditProvidingSchoolHolidaysClass = bulkEditProvidingBaseClass;
                    let providing_html = '';

                    //放デイ
                    if (use_services === 1 && $('.js_law2024').val()) {

                        // 提供形態選択済みの場合は選択状態保持するクラスを追加
                        // 放課後
                        if (providing_type === PROVIDING_AFTER_SCHOOL && (diff_check_time >= 30) && (diff_check_time != null)) {
                            bulkEditProvidingAfterSchoolClass += ' providingChecked gray';


                        //学休日
                        } else if (providing_type === PROVIDING_SCHOOL_HOLIDAYS && (diff_check_time >= 30) && (diff_check_time != null)) {

                            bulkEditProvidingSchoolHolidaysClass += ' providingChecked gray';

                        //提供形態があり　かつ　利用時間が30分未満の場合
                        } else if (providing_type && (diff_check_time < 30) && (diff_check_time != null)) {

                            //提供形態をリセットする
                            proViding_type = null;

                            $("input[name='list[" + id + "][providing_type]'][value='"+providing_type+"']").click();

                            // 算定区分と算定時間数をセットする
                            setTimeDivisionTimeSetAllEdit(id, use_services, providing_type);

                        }

                        providing_html = `
                            <label>
                                <input type="radio" name="list[${id}][providing_type]" value="1" class="radioBtn ${bulkEditProvidingAfterSchoolClass}">
                                <span class="btn btn-sm">放課後</span>
                            </label>
                            <label><br>
                                <input type="radio" name="list[${id}][providing_type]" value="2" class="radioBtn ${bulkEditProvidingSchoolHolidaysClass}">
                                <span class="btn btn-sm">学休日</span>
                            </label>`;

                    }

                    //令和６年法改正の前
                    if (startDate < checkDate_2024) {
                        //欠席時対応加算Ⅱの設定がされている場合
                        if ($("#providing" + id).find(".js_absence-two-on,.js_absence-two-off").length) {

                            if (window.confirm('利用時間が30分を超えるため、欠席時対応加算Ⅱの\r\n設定がリセットされます。よろしいでしょうか？')) {

                                //欠席時対応加算Ⅱの内容をリセット
                                $('[name="list[' + id + '][absence_two_flg]"]').val(0);
                                $('[name="list[' + id + '][absence_two_note]"]').val();
                                $('[name="list[' + id + '][absence_two_note_staff]"]').val(0);

                                //thirtyTime削除
                                $(this).closest('tr').find(".providing").removeClass("thirtyTime");

                                //提供形態をリセット
                                $("#providing" + id).html(providing_html);
                                $(`.js_children_area${id}`).find('.js_plantime_area:last').hide();

                            } else {
                                //判定用文字列を参考にして選択前の値を取得しval値に入れる
                                var before_val = $('.js_children_area' + id).find('.js_before_' + this_name).val();
                                $(this).val(before_val);
                                before_data_flg = 1;
                            }
                        } else {

                            //thirtyTime削除
                            $(this).closest('tr').find(".providing").removeClass("thirtyTime").end()
                                .find(".js_providing_reset").remove();

                            if (!$("#providing" + id).find(".radioBtn").length) {
                                //提供形態をリセット
                                $("#providing" + id).html(providing_html);
                                $(`.js_children_area${id}`).find('.js_plantime_area:last').hide();

                            }
                        }
                    } else {

                        //ハイライト削除
                        $(this).closest('tr').find(".js_utilization_time").parent().removeClass("thirtyTime");

                        $("#providing" + id).html(providing_html);
                    }
                }

                //児童発達支援の場合
                if (use_services === CHILD_DEVELOPMENT_SUPPORT || providing_type) {

                    $("input[name='list[" + id + "][providing_type]'][value='"+providing_type+"']").click();

                    // 算定区分と算定時間数をセットする
                    setTimeDivisionTimeSetAllEdit(id, use_services, providing_type);
                }
            }

            if ($(this).hasClass("selecttime")) {
                var min_val = $(this).next().val();
                var min_name = $(this).next().attr("name");
                min_name = min_name.replace(/\[/g, '').replace(/\]/g, '').replace(/list/g, '').replace(id, '');

                if (select_val && min_val == 0) {

                    if (before_data_flg === 1) {
                        $(this).next().val("");
                        $('.js_children_area' + id).find('.js_before_' + min_name).val();
                        return false;
                    } else {
                        $(this).next().val(0);
                        $('.js_children_area' + id).find('.js_before_' + min_name).val(0);
                    }
                }
            }

            if (before_data_flg !== 1) {
                //変更前のプルダウンの値を変更
                $('.js_children_area' + id).find('.js_before_' + this_name).val(select_val);
            }

            getCancelCount();

            // 加算の連動機能は入室時間が選択された時点で実行
            if (check_hour) {
                // 加算実績テーブルの出欠席更新
                $(`#js_adding_atndinfo${id}`).text("出席");
                //加算の連動処理
                if ($('.js_law2024').val()) {
                    setInterlockingAdding(id);
                } else {
                    updateAddingRows(id);
                }

                if (use_services == 2) {
                    // 食事提供加算用の処理
                    if (addingMealFlg && (addingMealVal === '0')) {

                        if (addingMealFlg == 1) {
                            var eq = 0;
                        } else if (addingMealFlg == 2) {
                            var eq = 1;
                        }
                        // 食事提供加算未登録で、連動機能ある場合はボタンを押下状態へ変更
                        $(this).closest('tr').find(".ameal .meal_btn").eq(eq).trigger('click');
                    }
                }
            } else {
                // 入室時間が未選択の場合は連動加算をリセット
                $(`#js_adding_atndinfo${id}`).text("");
                // 加算の連動加算リセット処理
                if ($('.js_law2024').val()) {
                    clearInterlockingAdding(id);
                } else {
                    DeleteAddingRows(id)
                }

                if (use_services == 2) {
                    // 食事提供加算用の処理
                    if (addingMealFlg && (addingMealVal === '1' || addingMealVal === '2')) {
                        // 食事提供加算登録済みで、連動機能ある場合はボタンを押下状態を解除
                        $(this).closest('tr').find(".ameal .meal_btn").trigger('click');
                    }
                }
            }
        }

        //利用時間の更新
        if ($('.js_utilization_time').length) {
            //実績時間の差を返す
            var interval_time = '';
            var interval_time_h = parseInt(diff_check_time/60);
            if (interval_time_h) {
                interval_time = parseInt(diff_check_time/60) + '時間';
            }
            interval_time += parseInt(diff_check_time%60) + '分';

            $(".js_children_area"+ id).find(".js_utilization_time").text(interval_time);
        }


        // 一括編集の一括設定でトリガーしているが、そちらでは別で連動処理を通すようにしたので、ここでは通さないようにする
        if (event.originalEvent !== undefined) {
            // 入退室時間のフォーマット
            let enter_time_hi = s_hour + ':' + (s_min < 10 ? '0' + s_min : s_min);
            let leave_time_hi = e_hour + ':' + (e_min < 10 ? '0' + e_min : e_min);

            // 延長支援時間を取得して、延長支援時間情報とモーダルを出すか出さないかを返す処理
            getDetailExtensionData(child_id, f_id, id, select_date, enter_time_hi, leave_time_hi, providing_type, 'allEdit', false, function(response) {
                if (response.modal_type !== null) {
                    // モーダルを表示
                    showExtensionModal(f_id, response.data, response.form_ary, false, 'all_edit');
                } else {
                    // モーダル表示しない場合はそのまま一括編集画面用の延長支援加算の連動処理実行
                    setExtensionTimeAllDetail(id, response.data, false);
                }
            });
        }

        // if文の条件次第で提供形態がclickされない場合があるので、ここでもフラグをリセット
        jsAttendTimeChanged = false;
    });

    //保育所の入退室時間を変更した場合(一括編集)
    $(document).on('change', '.js_attend_time_hoiku', function () {

        //idを取得する
        var id = getRid(this);

        var select_date = $("[name=date]").val();
        var select_date_ary = select_date.split('-');
        var s_hour = $('[name="hoiku_list[' + id + '][hoiku_s_hour]"]').val();
        var s_min = $('[name="hoiku_list[' + id + '][hoiku_s_min]"]').val();
        var e_hour = $('[name="hoiku_list[' + id + '][hoiku_e_hour]"]').val();
        var e_min = $('[name="hoiku_list[' + id + '][hoiku_e_min]"]').val();

        //利用時間の更新
        if ($('.js_utilization_time').length) {
            //実績時間の差を返す
            var diff_check_time = checkAttendanceDiffTime(select_date, s_hour, s_min, e_hour, e_min);

            var interval_time = '';
            var interval_time_h = parseInt(diff_check_time/60);
            if (interval_time_h) {
                interval_time = parseInt(diff_check_time/60) + '時間';
            }
            interval_time += parseInt(diff_check_time%60) + '分';

            $("#hoiku_time"+ id).find(".js_utilization_time").text(interval_time);
        }

        // 令和6年4月以降の場合は連動加算の処理実行
        if ($('.js_law2024').val()) {
            if (s_hour || s_min) {
                // 時間が入力されている場合は連動加算の追加
                setInterlockingAdding(id, 1);
            } else {
                // 時間が入力されていない場合は連動加算の削除
                clearInterlockingAdding(id, 1);
            }
        }
    });

    // 欠席時対応加算Ⅱのボタンを押した場合
    $(document).on('click', '.js_absence-two-button', function () {

        //内容と記録者を初期化
        $("[name=absence_two_note]").val();
        $("[name=dialog_absence_two_note_staff]").val(0);

        //idを取得する
        GlobalR_id = getRid(this);

        //施設ID
        var f_id = $('[name="list[' + GlobalR_id + '][f_id]"]').val();

        //欠席時対応加算Ⅱの理由を取得
        var absence_two_note = $('[name="list[' + GlobalR_id + '][absence_two_note]"]').val();

        //記録者取得
        var absence_two_note_staff = $('[name="list[' + GlobalR_id + '][absence_two_note_staff]"]').val();

        //文章がなければ空表示
        if (!absence_two_note) {
            $("[name=absence_two_note]").val('');
        } else {
            $("[name=absence_two_note]").val(absence_two_note);
        }

        //取得したIDでダイアログの記録者を選択
        $("[name=dialog_absence_two_note_staff]").val(absence_two_note_staff);

        //指導員の情報を取得し、selectに入れ込み
        var staff_options = $("#js_dialog_absence_staff_info" + f_id).html();
        $("[name=dialog_absence_two_note_staff]").html(staff_options);
        //指導員の施設絞り込み用にf_id格納
        $(".js_reference_combo_f_id").text(f_id);

        //非表示にしてプルダウンが開かないようにする
        $('#addtend_dialog02').find('.comboBoxStaffJquery').hide();
        $('#js_absence_two_note_staff').hide();
        $('#js_absence_two_note_dialog').hide();

        //ダイアログ表示
        $('#addtend_dialog02').dialog('open');

        //再表示
        $('#addtend_dialog02').find('.comboBoxStaffJquery').show();
        $('#js_absence_two_note_staff').show();
        $('#js_absence_two_note_dialog').show();

        return false;
    });

    //欠席時対応加算Ⅱ、提供形態をリセットのリンクを押した場合
    $(document).on('click', '.js_absence-two-on, .js_absence-two-off, .js_providing_reset', function () {

        //idを取得する
        var id = getRid(this);

        // 欠席時対応加算Ⅱ、欠席時対応加算Ⅱを算定しないリンク押下（リセット）時のみ加算の連動処理実行
        if ($(this).hasClass('js_absence-two-on') || $(this).hasClass('js_absence-two-off')) {
            // 加算実績テーブルの出欠席更新
            $(`#js_adding_atndinfo${id}`).text("出席");
            updateAddingRows(id);

        }

        //欠席時対応加算Ⅱと提供形態のフラグを初期化
        $('[name="list[' + id + '][absence_two_flg]"]').val(0);

        //1行用の高さに変更するための準備
        var num = $(".scrollable tr").index($(this).closest("tr"));
        var elm = $(this).closest("tr");

        var select_date = $("[name=date]").val();
        var select_date_ary = select_date.split('-');
        var startDate = new Date(select_date_ary[0], select_date_ary[1] - 1, select_date_ary[2], 0, 0, 0);
        var checkDate2024 = new Date(2024, 3, 1, 0, 0, 0);

        //提供形態をリセットした場合、算定プルダウンを非表示
        let children_area = $(`.js_children_area${id}`);
        let plantime_area = children_area.find('.js_plantime_area');
        //算定プルダウンを非表示
        plantime_area.hide();

        //一括編集画面の個別編集で提供形態をリセットした場合に表示
        let btn1 = '<button class="btn btn-sm js_regular_reward-button">基本報酬を算定する</button>';

        let btn2 = '';

        //令和６年法改正対応
        if (startDate >= checkDate2024) {
            //一括編集画面の個別編集で提供形態をリセットした場合に表示
            btn2 = '<label><input type="radio" name="list['+id+'][providing_type]" value="9" class="radioBtn"><span class="btn btn-sm">基本報酬を算定しない</span></label>';

        }else{
            btn2 = '<button class="btn btn-sm js_absence-two-button">欠席時対応加算Ⅱ</button>';
        }

        const providing_html = btn1 + btn2;

        //rowspanの調整
        $('.js_children_area' + id).find('.enter').attr('rowspan', 2);
        $('.js_children_area' + id).find('.leave').attr('rowspan', 2);
        $('.js_children_area' + id).find('.body_temp').attr('rowspan', 2);
        $('.js_children_area' + id).find('.providing').attr('rowspan', 2);
        $('.js_children_area' + id).find('.time_division').attr('rowspan', 1);
        //テキストエリア削除
        $('[name="list[' + id + '][reason_text]"]').closest('td').remove();

        $("#providing" + id).html(providing_html);

        getCancelCount();


        //高さの調整
        $(elm).height(50);
        $(elm).next().height(50);
        //合成テーブルも高さ設定
        $('.pinned .table tr').eq(num).height(50);
        $('.pinned .table tr').eq(num + 1).height(50);

        return false;
    });

    //基本報酬を算定するのボタンを押した場合
    $(document).on('click', '.js_regular_reward-button', function () {

        //idを取得する
        var id = getRid(this);

        //欠席時対応加算Ⅱフラグを初期化
        $('[name="list[' + id + '][absence_two_flg]"]').val(0);
        let bulkEditProvidingClass = "";
        if ($('.js_law2024').val()) {
            bulkEditProvidingClass = "js_bulk_edit_providing";
        }

        var providing_html = '<label>' +
            '<input type="radio" name="list[' + id + '][providing_type]" value="1" class="radioBtn '+ bulkEditProvidingClass + '">' +
            '<span class="btn btn-sm">放課後</span>' +
            '</label> ' +
            '<label>' +
            '<input type="radio" name="list[' + id + '][providing_type]" value="2" class="radioBtn '+ bulkEditProvidingClass + '" >' +
            '<span class="btn btn-sm">学休日</span>' +
            '</label>' +
            '<span class="db lh2 js_providing_reset">' +
            '<a href="#" class="enter green">' +
            '<b>提供形態をリセット</b>' +
            '</a>' +
            '</span>';

        $("#providing" + id).html(providing_html);
        getCancelCount();
        return false;
    });

    //テキストエリアに書き込んだものをinputに反映させる
    $(function () {
        $(document).on('input', '.js_reason_text', function () {
            //どの列のテキストエリアか判別するためのID取得
            let text_id = $(this).attr('id');
            //テキストエリアの文章を取得
            let text_val = $(this).val();
            //欠席時対応加算のⅠかⅡを判別するためのフラグ取得
            let absence_type = $(this).attr('data-absence');

            //inputのなかに入れ込む
            if (absence_type == 1) {
                $('[name="list[' + text_id + '][absence_note]"]').val(text_val);
            } else if (absence_type == 2) {
                $('[name="list[' + text_id + '][absence_two_note]"]').val(text_val);
            }
        });
    });

    //選択したスタッフをinputに反映させる
    $(function () {
        $(document).on('input', '.js_reason_staff', function () {
            //どの列のテキストエリアか判別するためのID取得
            let text_id = $(this).attr('id');
            let staff_id = text_id.replace('js_staff', '');

            //テキストエリアの文章を取得
            let staff_val = $(this).val();
            //欠席時対応加算のⅠかⅡを判別するためのフラグ取得
            let absence_type = $(this).attr('data-absence');

            //inputのなかに入れ込む
            if (absence_type == 1) {
                $('[name="list[' + staff_id + '][absence_note_staff]"]').val(staff_val);
            } else if (absence_type == 2) {
                $('[name="list[' + staff_id + '][absence_two_note_staff]"]').val(staff_val);
            }
        });
    });

    // 欠席を押した時
    $(document).on('click', '.js_absence-on-button', function () {

        //idを取得する
        GlobalR_id = getRid(this);
        GlobalAbsence = $(this);

        //欠席時対応加算の理由を取得
        var absence_note = $('[name="list[' + GlobalR_id + '][absence_note]"]').val();
        $("[name=absence_two_note]").val(absence_note);

        //欠席時対応加算の記録者を取得
        var absence_note_staff = $('[name="list[' + GlobalR_id + '][absence_note_staff]"]').val();
        $("[name=dialog_absence_note_staff]").val(absence_note_staff);

        //施設ID
        var c_id = $('[name="list[' + GlobalR_id + '][c_id]"]').val();
        var f_id = $('[name="list[' + GlobalR_id + '][f_id]"]').val();

        setAbsenceTimes(c_id, f_id);

        //非表示にしてプルダウンが開かないようにする
        $('#addtend_dialog').find('.comboBoxStaffJquery').hide();
        $('#js_absence_note_staff').hide();
        $('#js_absence_note_dialog').hide();

        //ダイアログ表示
        $('#addtend_dialog').dialog('open');

        //再表示
        $('#addtend_dialog').find('.comboBoxStaffJquery').show();
        $('#js_absence_note_staff').show();
        $('#js_absence_note_dialog').show();

        setAttendHeight();

        //加算の連動文削除
        DeleteAddingRows(GlobalR_id)



        return false;
    });

    // // 理由変更を押した時 ＊ボタン
    // $(document).on('click', '.absence_reason_edit3', function () {

    //     //idを取得する
    //     GlobalR_id = getRid(this);
    //     GlobalAbsence = $(this);

    //     //欠席時対応加算の場合
    //     if ($(GlobalAbsence).hasClass('js_ar_edit')) {
    //         //欠席時対応加算の理由を取得
    //         if ($(GlobalAbsence).hasClass('js_ar')) {
    //             $('#ui-id-5').html('欠席時対応加算の理由を編集する');
    //         } else {
    //             $('#ui-id-5').html('欠席理由を編集する');
    //         }
    //         var absence_note = $('[name="list['+GlobalR_id+'][absence_note]"]').val();
    //         $("[name=absence_note3]").val(absence_note);

    //         //欠席時対応加算の記録者を取得
    //         var absence_note_staff = $('[name="list['+GlobalR_id+'][absence_note_staff]"]').val();
    //         $("[name=dialog_absence_note_staff3]").val(absence_note_staff);

    //         //施設ID
    //         var c_id = $('[name="list['+GlobalR_id+'][c_id]"]').val();
    //         var f_id = $('[name="list['+GlobalR_id+'][f_id]"]').val();
    //         setAbsenceTimes(c_id, f_id);

    //     } else if ($(GlobalAbsence).hasClass('js_ar_edit_two')) {
    //         //欠席時対応加算の理由を取得
    //         if ($(GlobalAbsence).hasClass('js_ar_two')) {
    //             $('#ui-id-5').html('欠席時対応加算Ⅱの理由を編集する');
    //         } else {
    //             $('#ui-id-5').html('欠席理由を編集する');
    //         }

    //         //欠席時対応加算の備考を取得する
    //         var absence_two_note = $('[name="list['+GlobalR_id+'][absence_two_note]"]').val();
    //         $("[name=absence_note3]").val(absence_two_note);

    //         //欠席時対応加算の記録者を取得する
    //         var absence_two_note_staff = $('[name="list['+GlobalR_id+'][absence_two_note_staff]"]').val();
    //         $("[name=dialog_absence_note_staff3]").val(absence_two_note_staff);
    //     }

    //     //ダイアログ表示
    //     $('#addtend_dialog3').dialog('open');
    //     return false;
    // });

    //提供形態を押した場合
    $(document).on('click', '.radioBtn', function () {
        $(this).closest("td").find(".radioBtn").removeClass("providingChecked gray");
        $(this).addClass("providingChecked gray");
    });

    // 欠席（欠席時対応加算を取らない）を押した時
    $(document).on('click', '.js_absence_off', function () {
        //idを取得する
        GlobalR_id = getRid(this);
        let absence_staff = $('[name="list[' + GlobalR_id + '][absence_note_staff]"]').val();
        let absence_note = $('[name="list[' + GlobalR_id + '][absence_note]"]').val();

        var absence_times = parseInt($(this).prev().attr("abs_times"));
        var hidden = '<input type="hidden" value="3" name="list[' + GlobalR_id + '][attend_flg]" abs_times="' + absence_times + '">';
        var absence_reason_edit = '<div class="js_reason_div"><b>[記録者]</b>&nbsp; <span class="dib"><select class="mr10 comboBoxStaffJquery" id="js_combo' + GlobalR_id + '"></select>&nbsp;<select class="js_reason_staff" id="js_staff' + GlobalR_id + '" data-absence="1"></select></span><textarea name="list[' + GlobalR_id + '][reason_text]" id=' + GlobalR_id + ' rows="2" class="form-control mt5 js_reason_text db minH14em" data-absence="1" placeholder="理由記入欄"></textarea></div>';
        $(this).parent().html(hidden + absenceOffHTML + absence_reason_edit);

        //スタッフのプルダウン取得
        let combo_copy = $('.comboBoxStaffJquery:first').clone();
        let staff_copy = $('#js_setting_absence_note_staff').clone();
        $(combo_copy).children('option').each(function (i, combo) {
            $('#js_combo' + GlobalR_id).append(combo);
        });

        $($(staff_copy).children('option')).each(function (i, staff) {
            $('#js_staff' + GlobalR_id).append(staff);
        });
        $('#js_combo' + GlobalR_id).val(0);
        $('#js_staff' + GlobalR_id).val(absence_staff);
        if (absence_note) {
            $('[name="list[' + GlobalR_id + '][reason_text]"]').val(absence_note)
        } else {
            let c_id = $('[name="list[' + GlobalR_id + '][c_id]"]').val();
            let f_id = $('[name="list[' + GlobalR_id + '][f_id]"]').val();
            setAbsenceTimes(c_id, f_id);
        }

        // 食事提供加算用の処理
        let meal_offer_flg = $('[name="list[' + GlobalR_id + '][meal_offer_flg]"]').val();　// 食事提供加算の対象児童なのかを取得
        let addingMealFlg = $('[name="list[' + GlobalR_id + '][adding_meal_flg]"]').val();　// 食事提供加算の連動機能有無を取得
        let addingMealVal = $('[name="list[' + GlobalR_id + '][adding_meal_id]"]').val();　// 食事提供加算の値を取得

        // 食事提供加算対象児童で、連動機能ある場合は「なし」を表示
        if ((addingMealFlg === '1') && (meal_offer_flg === '1')) {
            if (addingMealVal === '1') {
                $("#meal" + GlobalR_id + " .meal_btn").trigger('click');
            }
            $("#meal" + GlobalR_id + " .meal_btn").hide();
            $("#meal" + GlobalR_id + " b").show();
        }


        // 加算実績テーブルの出欠席更新
        $(`#js_adding_atndinfo${GlobalR_id}`).html('<b class="red">欠席(欠席時対応加算を取らない)</b>');
        //加算のリセット処理ここに書く
        DeleteAddingRows(GlobalR_id)

        getCancelCount();
        setAttendHeight();
        return false;
    });

    // 実費を押した時
    $(document).on('click', '.cost_type', function () {
        //idを取得する
        var id = $(this).parent().parent().parent().parent().parent().data("rid");
        var text = $(this).text(); //実費名を取得する
        var val = $(this).parent().find('input').val(); //value値を取得する
        var cost_id = "";
        var cost_id_ary = [];
        // liのidを取得
        cost_id = $(this).closest("li").attr("id");
        cost_id_ary = cost_id.split("_");

        if (cost_id_ary[1] == "4") {
            if ($('input[name="hoiku_list[' + id + '][cost][' + cost_id_ary[1] + '][' + val + ']"]').prop("checked")) {
                $(this).text(text.replace(/済/g, ""));
            } else {
                $(this).text(text + " 済");
            }
        } else if (cost_id_ary[1] == "7") {
            if ($('input[name="consul_list[' + id + '][cost][' + cost_id_ary[1] + '][' + val + ']"]').prop("checked")) {
                $(this).text(text.replace(/済/g, ""));
            } else {
                $(this).text(text + " 済");
            }
        } else if (cost_id_ary[1] == "9") {
            if ($('input[name="plan_con_list[' + id + '][cost][' + cost_id_ary[1] + '][' + val + ']"]').prop("checked")) {
                $(this).text(text.replace(/済/g, ""));
            } else {
                $(this).text(text + " 済");
            }
        } else {
            if ($('input[name="list[' + id + '][cost][' + cost_id_ary[1] + '][' + val + ']"]').prop("checked")) {
                $(this).text(text.replace(/済/g, ""));
            } else {
                $(this).text(text + " 済");
            }
        }
    });

    // お弁当ボタン
    $(document).on('click', '.lunchbtn', function () {
        var id = getRid(this); //idを取得する
        var text = $(this).text(); //お弁当名を取得する
        var lunch = $(this).val(); //お弁当フラグを取得する
        var val = $(this).prev().val(); //hidden値を取得する
        //hidden値が0の場合
        if (val == 0) {
            var hidden = '<input type="hidden" name="list[' + id + '][lunch_status]" value="' + lunch + '">';
            var html = '<a href="#" class="green lunchbtn"><b>' + text + '&nbsp;提供済</b></a>';
        } else {
            var hidden = '<input type="hidden" name="list[' + id + '][lunch_status]" value="0">';
            var html = '<button type="button" class="btn btn-sm lunchbtn" value="' + val + '">' + text.replace(/\s+提供済/g, "") + '</button>';
        }
        $(this).parent().html(hidden + html);
        return false;
    });

    // 食事提供加算
    $(document).on('click', '.meal_btn', function () {
        var id = getRid(this); //idを取得する
        var text = $(this).text(); //お弁当名を取得する
        var this_val = $(this).val(); //お弁当フラグを取得する
        var val = $(this).closest('td').find('input').val(); //hidden値を取得する
        //hidden値が0の場合
        if (val == 0) {
            var hidden = '<input type="hidden" name="list[' + id + '][adding_meal_id]" value="' + this_val + '">';
            var html = '<a href="#" class="green meal_btn"><b>' + text + '&nbsp;提供済</b></a><b style="display: none">無し</b>';
        } else {
            if ($('.js_law2024').val()) {
                var hidden = '<input type="hidden" name="list[' + id + '][adding_meal_id]" value="0">';
                var html = '<button type="button" class="btn btn-sm meal_btn" value="1">加算（I）</button><b style="display: none">無し</b>';
                html += '<button type="button" class="btn btn-sm meal_btn" value="2">加算（II）</button><b style="display: none">無し</b>';
            } else {
                var hidden = '<input type="hidden" name="list[' + id + '][adding_meal_id]" value="0">';
                var html = '<button type="button" class="btn btn-sm meal_btn" value="' + val + '">' + text.replace(/\s+提供済/g, "") + '</button><b style="display: none">無し</b>';
            }
        }
        $(this).parent().html(hidden + html);
        return false;
    });

    //保育所等訪問支援用
    $(document).on('click', '.hoiku_attend', function () {
        //idを取得する
        var id = getRid(this);
        var use = $(this).parent().prev().find('input').val();
        //ココからtdを４つ作成する
        var td1_1 = '<td class="hoiku_enter"><input type="hidden" class ="green" value="1" name="hoiku_list[' + id + '][hoiku_attend_flg]"><select name="hoiku_list[' + id + '][hoiku_s_hour]" class="selecttime js_attend_time_hoiku">' + hour_option + '</select>： ';
        var td1_2 = '<select name="hoiku_list[' + id + '][hoiku_s_min]">' + time_option + '</select></td>';
        var td2_1 = '<td class="hoiku_leave"><select name="hoiku_list[' + id + '][hoiku_e_hour]" class="selecttime js_attend_time_hoiku">' + hour_option + '</select>： ';
        var td2_2 = '<select name="hoiku_list[' + id + '][hoiku_e_min]">' + time_option + '</select></td>';

        $(this).parent().parent().children('.hoiku_enter').after(td1_1 + td1_2 + td2_1 + td2_2);
        $(this).parent().remove();
        getCancelCountHoiku();
    });

    // キャンセルを押したとき(保育所等訪問支援)
    $(document).on('click', '.hoiku_absence-on', function () {
        //idを取得する
        var id = getRid(this);
        var HoikuabsenceOnHTML = '<a href="#" class="hoiku_enter red hoiku_absence-off"><b>キャンセル</b></a>';
        var hidden = '<input type="hidden" value="2" name="hoiku_list[' + id + '][hoiku_attend_flg]">';
        $("#js_adding_atndinfo" + id + "_hoiku").text("キャンセル"); // 加算実績テーブルの出欠更新
        $(this).parent().html(hidden + HoikuabsenceOnHTML);
        getCancelCountHoiku();

        // 令和6年4月以降の場合は連動加算を削除
        if ($('.js_law2024').val()) {
            clearInterlockingAdding(id, 1);
        }

        return false;
    });

    getCancelCount();
});


//idを取得する関数3つで使うため分離
function getRid(elm) {
    var rid = $(elm).closest('tr').data("rid");
    return rid;
}


// 操作オプションの挙動
// チェックボックスの高さをそろえる
$(function () {
    $('.checkLabel').parents('tr').each(function () {
        var h = $(this).height();
        $(this).find('.checkLabel').css({
            height: h,
            'line-height': h + 'px'
        });
    });
});


// 時間・体温の選択
$(function () {
    $(document).on('change', '.hour', function () {
        var hour = $(this).val();
        var min = $(this).next().val();
        if (!min || min == "9999") {
            $(this).next().removeClass('disable').prop('disabled', false).val(0);
        } else if (hour == 0 || hour == "9999") {
            $(this).next().addClass('disable').prop('disabled', true).val('');
        }
    });

    $(document).on('change', '.temp', function () {
        var temp = $(this).val();
        var temp_next = $(this).next().val();
        1
        if (temp != 0 && (!temp_next || temp_next == "9999")) {
            $(this).next().removeClass('disable').prop('disabled', false).val(0);
        } else if (temp == 0 || temp == "9999") {
            $(this).next().addClass('disable').prop('disabled', true).val('');
        }
    });
});


// すべてチェック・すべて解除
$(function () {
    $('.checkAll_hanei').on('click', function () {
        var check = $(this).text();
        if (check == "すべて解除") {
            $(".all_hanei_flg").prop('checked', false);
            $(this).html('すべて<br>チェック');
        } else {
            $(".all_hanei_flg").prop('checked', true);
            $(this).html('すべて<br>解除');
        }
        return false;
    });

    $('.checkAll_hanei_hoiku').on('click', function () {
        var check = $(this).text();
        if (check == "すべて解除") {
            $(".all_hanei_flg_hoiku").prop('checked', false);
            $(this).html('すべて<br>チェック');
        } else {
            $(".all_hanei_flg_hoiku").prop('checked', true);
            $(this).html('すべて<br>解除');
        }
        return false;
    });

    $('.checkAll_hanei_consul').on('click', function () {
        var check = $(this).text();
        if (check == "すべて解除") {
            $(".all_hanei_flg_consul").prop('checked', false);
            $(this).html('すべて<br>チェック');
        } else {
            $(".all_hanei_flg_consul").prop('checked', true);
            $(this).html('すべて<br>解除');
        }
        return false;
    });
});


// チェックボックスの有無でhighlightクラスの付け外しとプルダウン生業
$(function () {
    var check = '.checkLabel input'
    checkFunc(check);
    $(check).on('click', function () {
        checkFunc($(this));
    });

    function checkFunc(elm) {
        if ($(elm).prop('checked') == true) {
            $(elm).parents('tr').find('select').removeClass('disable').prop('disabled', false);
            $(elm).parents('tr').find('.minutes').addClass('disable').prop('disabled', true);
            $(elm).parents('tr').find('.point').addClass('disable').prop('disabled', true);
            $(elm).parents('tr').find('.btn').removeClass('disable');
        } else {
            // $(elm).parents('tr').removeClass('highlight');
            $(elm).parents('tr').find('select').addClass('disable').prop('disabled', true);
            $(elm).parents('tr').find('.btn').addClass('disable');
        }
    }

    $('.checkAll').on('click', function () {
        $(this).parents('.table').find('tr').each(function () {
            var checked = $(this).find('.checkLabel input').prop('checked');
            if (checked == true) {
                $(this).find('select').removeClass('disable').prop('disabled', false);
                $(this).find('.minutes').addClass('disable').prop('disabled', true);
                $(this).find('.point').addClass('disable').prop('disabled', true);
                $(this).find('.btn').removeClass('disable');
            } else {
                // $(this).removeClass('highlight');
                $(this).find('select').addClass('disable').prop('disabled', true);
                $(this).find('.btn').addClass('disable');
            }
        });
    });
});


// 反映ボタンの挙動(一括編集)
$(function () {
    $('.attendanceOption input, .attendanceOption select').on('change', function () {
        var check = $(this).val();
        if (check != 0) {
            $('.allSetBtn').removeClass('disable');
        }
    });

    $(document).on('click', '[name=attend_hanei]', function () {

        var attend_flg = $(this).val();

        //欠席の場合
        if (attend_flg == 2) {
            $("#js_setting_absence_note_area").closest("tr").show();
            $("#js_absence_hanei2").show();
            $("#js_absence_hanei3").hide();

        } else if (attend_flg == 3) {
            $("#js_setting_absence_note_area").closest("tr").show();
            $("#js_absence_hanei3").show();
            $("#js_absence_hanei2").hide();

        } else {
            $("#js_setting_absence_note_area").closest("tr").hide();
            $("#js_absence_hanei2").hide();
            $("#js_absence_hanei3").hide();
        }

        AllEditAbsenceTwo();
    });

    $(document).on('change', '#enter_hour_all, #enter_min_all, #leave_hour_all, #leave_min_all', function () {
        AllEditAbsenceTwo();
    });

    //ボタンの挙動
    $(document).on('click', '#omukae', function () {
        if ($(this).prop("checked")) {
            $("#enter_hour_all").addClass("disable").prop("disable", true);
            $("#enter_min_all").addClass("disable").prop("disable", true);
        } else {
            $("#enter_hour_all").removeClass("disable").prop("disable", false);
            $("#enter_min_all").removeClass("disable").prop("disable", false);
        }
        AllEditAbsenceTwo();
    });

    $(document).on('click', '#okuri', function () {
        if ($(this).prop("checked")) {
            $("#leave_hour_all").addClass("disable").prop("disable", true);
            $("#leave_min_all").addClass("disable").prop("disable", true);
        } else {
            $("#leave_hour_all").removeClass("disable").prop("disable", false);
            $("#leave_min_all").removeClass("disable").prop("disable", false);
        }
        AllEditAbsenceTwo();
    });

    //一括設定の提供形態を押した場合 放課後/学休日
    $(document).on('change', '[name=setting_provide_attend_type], [name=setting_absence_two_type]', function () {



        AllEditAbsenceTwo();
    });

    // 一括編集画面の【反映】ボタンをおす
    $(document).on('click', '.allSetBtn', function () {

        //出欠席
        if (window.confirm('現在、記録されている情報がある場合、上書きされますがよろしいですか？')) {
            var obj = new Object();
            var obj_check = new Object();
            var obj_noncheck = new Object();
            let ExtensionInterlockingAry = {};
            $("#inputValue input:radio:checked").each(function () {
                obj[this.name] = this.value;
            });
            $("#inputValue select").each(function () {
                obj[this.id] = this.value;
            });

            $("#inputValue input:checkbox:checked").each(function () {
                obj_check[this.name] = this.value;
            });

            var select_date = $("[name=date]").val();

            var select_date_ary = select_date.split('-');
            var startDate = new Date(select_date_ary[0], select_date_ary[1] - 1, select_date_ary[2], 0, 0, 0);
            var checkDate = new Date(2021, 3, 1, 0, 0, 0);
            var checkDate2024 = new Date(2024, 3, 1, 0, 0, 0);

            var setting_provide_attend_type = 0;
            var setting_absence_two_type = 0;
            //提供形態の値を保持 放課後/学休日
            let setting_providing_type = parseInt($("#provide_hantei").val());

            //4/1以降の場合
            if (startDate >= checkDate) {
                var absence_two_note = $("#js_setting_absence_two_note").val();
                var absence_two_note_staff = $('#js_setting_absence_two_note_staff').val();

                if ($("#setting_provide_attend_type").is(':visible')) {
                    var setting_provide_attend_type = $("#setting_provide_attend_type").val();

                    if (setting_provide_attend_type == 1) {
                        //提供形態の値を保持    放課後/学休日
                        setting_providing_type = $("#provide_hantei").val();
                    } else if (setting_provide_attend_type == 2) {
                        var setting_absence_two_type = $("#setting_absence_two_type").val();
                    }
                }
            }

            var absence_note = $("#js_setting_absence_note").val();
            var absence_note_staff = $('#js_setting_absence_note_staff').val();

            //出欠席のチェック状況をまず判定
            // if (window.innerWidth <= 768) {
            //     var element_change = '.scrollable #releasetable > tr';
            // } else {
            var element_change = '#releasetable > tr';
            // }

            // 下記ループ内で食事提供加算のボタン処理用（何故か同じループを繰り返すため初回を判別するためのフラグ）
            let firstLoopDone = false; // フラグを初期化

            $(element_change).each(function () {
                //参照するチェックボックスの要素を選択する
                // if (window.innerWidth <= 768) {
                //     var checkbox_element = '.pinned #releasetable > tr';
                // } else {
                var checkbox_element = '#releasetable > tr';
                // }
                //r_idを取得する
                var id = $(this).data("rid");
                //チェックあるやつだけ処理する
                if ($(checkbox_element).find(".js_attendance_check" + id).prop("checked")) {
                    //提供形態の値を保持
                    var keitai = $(this).find('[name="list[' + id + '][providing_type]"]:checked').val();
                    var s_hour_tmp = $(this).find('[name="list[' + id + '][s_hour]"]').val();
                    var s_min_tmp = $(this).find('[name="list[' + id + '][s_min]"]').val();
                    var e_hour_tmp = $(this).find('[name="list[' + id + '][e_hour]"]').val();
                    var e_min_tmp = $(this).find('[name="list[' + id + '][e_min]"]').val();
                    var body_temp_tmp = $(this).find('[name="list[' + id + '][body_temp]"]').val();
                    let use_services = parseInt($(`[name="list[${id}][use_services]"]`).val());
                    var body_temp_point_tmp = $(this).find('[name="list[' + id + '][body_temp_point]"]').val();
                    var delete_elem = $(this).find(".delete");
                    let addingMealVal = $(this).find('input[name="list[' + id + '][adding_meal_id]"]').val();　// 食事提供加算の値を取得
                    let meal_offer_flg = $(this).closest('tbody').find('input[name="list[' + id + '][meal_offer_flg]"]').val();　// 食事提供加算の対象かどうかを取得
                    let addingMealFlg = $(this).closest('tbody').find('input[name="list[' + id + '][adding_meal_flg]"]').val();　// 食事提供加算の連動機能有無を取得

                    // Success_all(delete_elem, id, 0);

                    // if (window.innerWidth <= 768) {
                    //     //一旦この高さに調整する
                    //     $('.js_first_tr').height(50);
                    //     $('.js_second_tr').height(50);
                    // }

                    if (obj.attend_hanei > 0) {
                        //出席とかの判定から
                        if (obj.attend_hanei == 1) {

                            //出席にする
                            $(this).find(".attend").trigger("click");

                            //入室時間
                            //「お迎え希望時間を入室時間に反映する」を反映する場合
                            if ($("#omukae").prop("checked")) {
                                s_hour_tmp = parseInt($(this).find(".mukae_hour").val()) - 1;
                                s_min_tmp = parseInt($(this).find(".mukae_time").val()) - 1;
                            } else if (obj["enter_hour_all"] != "9999") {
                                //入室時間を選択している場合
                                s_hour_tmp = obj["enter_hour_all"];

                                if (obj["enter_min_all"] != "9999") {
                                    s_min_tmp = obj["enter_min_all"];
                                }
                            }

                            // 食事提供加算用の処理
                            if (!firstLoopDone && (obj["enter_hour_all"] != "9999") && (addingMealFlg === '1') && (addingMealVal === '0')) {
                                // 初回ループで、出席時間が入力されており、食事加算連動機能がある場合はボタンを押下状態へ変更
                                $("#meal" + id + " .meal_btn").show();
                                $("#meal" + id + " b").hide();

                                $(this).find(".ameal .meal_btn").trigger('click');
                                firstLoopDone = true;
                            } else {
                                firstLoopDone = false;
                            }

                            //入室時間挿入
                            $(this).find('[name="list[' + id + '][s_hour]"]').val(s_hour_tmp);
                            $(this).find('[name="list[' + id + '][s_min]"]').val(s_min_tmp);

                            //退室時間
                            //「送り希望時間を退室時間に反映する」を反映する場合
                            if ($("#okuri").prop("checked")) {
                                e_hour_tmp = parseInt($(this).find(".okuri_hour").val()) - 1;
                                e_min_tmp = parseInt($(this).find(".okuri_time").val()) - 1;
                            } else if (obj["leave_hour_all"] != "9999") {
                                //退室時間を選択している場合
                                e_hour_tmp = obj["leave_hour_all"];

                                if (obj["leave_min_all"] != "9999") {
                                    e_min_tmp = obj["leave_min_all"];
                                }
                            }

                            //退室時間挿入
                            $(this).find('[name="list[' + id + '][e_hour]"]').val(e_hour_tmp);
                            $(this).find('[name="list[' + id + '][e_min]"]').val(e_min_tmp);

                            //体温
                            if (obj["tmpa"] != "9999") {
                                body_temp_tmp = obj["tmpa"];

                                if (obj["tmpa_small"] != "9999") {
                                    body_temp_point_tmp = obj["tmpa_small"];
                                }
                            }

                            //体温挿入
                            $(this).find('[name="list[' + id + '][body_temp]"]').val(body_temp_tmp);
                            $(this).find('[name="list[' + id + '][body_temp_point]"]').val(body_temp_point_tmp);

                            //放デイサービスの場合または2024/4/1以降の場合
                            if (use_services < 2 || startDate >= checkDate2024) {

                                //4/1以降の場合
                                if (startDate >= checkDate) {
                                    //実績時間の差を返す
                                    var diff_check_time = checkAttendanceDiffTime(select_date, s_hour_tmp, s_min_tmp, e_hour_tmp, e_min_tmp);

                                    var show_absence_two_flg = $('.js_show_absence_two_flg').val();

                                    //30分未満なら画面表示
                                    if ((diff_check_time < 30) && (diff_check_time != null)) {

                                        //30分用のデフォルトボタンを表示
                                        if (startDate >= checkDate && startDate < checkDate2024) {
                                            $("#providing" + id).addClass("thirtyTime");
                                        }

                                        //実績時間が30分未満　算定区分を空にする
                                        $(`.js_${id}_time_division`).val('');
                                        //実績時間が30分未満　算定時間数を空にする
                                        $(`.js_${id}_time_set`).val('');

                                        //提供形態(放課後・学休日)が選択されるまで、計画で算定or実績で算定のプルダウンを非表示にする
                                        let children_area = $(`.js_children_area${id}`);
                                        let plantime_area = children_area.find('.js_plantime_area');
                                        plantime_area.hide();

                                        // 令和６年法改正の前
                                        if (show_absence_two_flg == 1) {
                                            $("#providing" + id).html('<button class="btn btn-sm js_regular_reward-button">基本報酬を算定する</button>' + '<button class="btn btn-sm js_absence-two-button js_attend_absence_two">欠席時対応加算Ⅱ</button>');
                                        }else{
                                            if (startDate >= checkDate && startDate < checkDate2024) {
                                                $("#providing" + id).find('.js_no_calculate_btn').remove();
                                                let no_calculate_btn = '<label class="js_no_calculate_btn"><input type="radio" name="list[' + id + '][providing_type]" value="5" class="radioBtn"><span class="btn btn-sm">基本報酬を算定しない</span></label>';
                                                $("#providing" + id).append(no_calculate_btn);

                                                let children_area = $(`.js_children_area${id}`);
                                                let plantime_area = children_area.find('.js_plantime_area');
                                                plantime_area.hide();
                                            }
                                        }

                                        //通常報酬か欠席時対応加算Ⅱの選択肢を選んでいる場合
                                        if (setting_provide_attend_type > 0) {

                                            //基本報酬を算定する場合
                                            if (setting_provide_attend_type == 1) {

                                                //通常報酬を算定を押す
                                                $("#providing" + id).find(".js_regular_reward-button").trigger("click");

                                                //提供形態の値を入れる
                                                keitai = setting_providing_type;

                                            } else if (setting_provide_attend_type == 2) {
                                                //欠席時対応加算Ⅱを選択した場合
                                                keitai = 0;
                                                //既にあるテキストエリアは消す
                                                $('[name="list[' + id + '][reason_text]"]').closest('td').remove();

                                                //利用時間があれば
                                                if ($('.js_law2024').val()) {
                                                    var colspan = 5;
                                                } else {
                                                    var colspan = 4;
                                                }

                                                //欠席時対応加算Ⅱを算定する場合
                                                if (setting_absence_two_type == 1) {
                                                    $('[name="list[' + id + '][absence_two_flg]"]').val(1);
                                                    $('[name="list[' + id + '][absence_two_note]"]').val(absence_two_note);
                                                    $('[name="list[' + id + '][absence_two_note_staff]"]').val(absence_two_note_staff);
                                                    var absence_on_html = '<a href="#" class="enter red js_absence-two-on js_attend_absence_two dib mt10"><b>欠席時対応加算Ⅱ</b></a>';
                                                    var absence_reason_edit = '<td colspan="'+colspan+'" class="tal"><div class="js_reason_div"><b>[記録者]</b>&nbsp; <span class="dib"><select class="mr10 comboBoxStaffJquery" id="js_combo' + id + '"></select>&nbsp;<select class="js_reason_staff" id="js_staff' + id + '" data-absence="2"></select></span><textarea name="list[' + id + '][reason_text]" id=' + id + ' rows="2" class="form-control mt5 js_reason_text db js_ar_edit_two js_ar_two minH14em" data-absence="2" placeholder="理由記入欄"></textarea></div></td>';

                                                    // 加算実績テーブルの出欠席更新
                                                    $(`#js_adding_atndinfo${id}`).html('<b class="red">欠席時対応加算Ⅱ</b>');

                                                } else if (setting_absence_two_type == 2) {
                                                    //欠席時対応加算Ⅱなしの場合
                                                    $('[name="list[' + id + '][absence_two_flg]"]').val(2);
                                                    //2022年9月リリース分にて理由を残せるように変更
                                                    $('[name="list[' + id + '][absence_two_note]"]').val(absence_two_note);
                                                    $('[name="list[' + id + '][absence_two_note_staff]"]').val(absence_two_note_staff);
                                                    var absence_on_html = '<a href="#" class="enter red js_absence-two-off js_attend_absence_two dib mt10"><b>欠席時対応加算Ⅱを算定しない</b></a>';
                                                    var absence_reason_edit = '<td colspan="'+colspan+'" class="tal"><div class="js_reason_div"><b>[記録者]</b>&nbsp; <span class="dib"><select class="mr10 comboBoxStaffJquery" id="js_combo' + id + '"></select>&nbsp;<select class="js_reason_staff" id="js_staff' + id + '" data-absence="2"></select></span><textarea name="list[' + id + '][reason_text]" id=' + id + ' rows="2" class="form-control mt5 js_reason_text db js_ar_edit_two js_ar_two minH14em" data-absence="2" placeholder="理由記入欄"></textarea></div></td>';

                                                    // 加算実績テーブルの出欠席更新
                                                    $(`#js_adding_atndinfo${id}`).html('<b class="red">欠席時対応加算Ⅱを算定しない</b>');

                                                }
                                                $("#providing" + id).html(absence_on_html);

                                                //スタッフの情報を入れる
                                                if ($('.js_children_area' + id).next('tr').data('rid') == id) {
                                                    $('.js_children_area' + id).find('.enter').attr('rowspan', 1);
                                                    $('.js_children_area' + id).find('.leave').attr('rowspan', 1);
                                                    $('.js_children_area' + id).find('.body_temp').attr('rowspan', 1);
                                                    $('.js_children_area' + id).find('.providing').attr('rowspan', 1);
                                                    $('.js_tr_area' + id).prepend(absence_reason_edit)
                                                }
                                                $('[name="list[' + id + '][reason_text]"]').val(absence_two_note);

                                                //スマホ表示の時にもう一つのtableの欠席時対応加算Ⅱは非表示にする
                                                // if (window.innerWidth <= 768) {
                                                //     $('.pinned').find('.tal').hide();
                                                // }

                                                //スタッフのプルダウン取得
                                                let combo_copy = $('.comboBoxStaffJquery:first').clone();
                                                let staff_copy = $('#js_setting_absence_note_staff').clone();
                                                $(combo_copy).children('option').each(function (i, combo) {
                                                    $('#js_combo' + id).append(combo);
                                                });

                                                $($(staff_copy).children('option')).each(function (i, staff) {
                                                    $('#js_staff' + id).append(staff);
                                                });
                                                $('#js_combo' + id).val(0);
                                                $('#js_staff' + id).val(absence_two_note_staff);

                                                //加算のリセット処理ここに書く
                                                DeleteAddingRows(id)
                                            }

                                        } else {
                                            keitai = setting_providing_type;
                                        }
                                    } else {
                                        keitai = setting_providing_type;
                                    }
                                } else {
                                    keitai = setting_providing_type;
                                }

                                //提供形態挿入
                                if (keitai == 1 || keitai == 2) {
                                    $(this).find('[name="list[' + id + '][providing_type]"]').val([keitai]);
                                }

                                //放課後・学休日を選択する場合
                                if (keitai > 0) {

                                    $('[name="list[' + id + '][absence_two_flg]"]').val(0);
                                    $('[name="list[' + id + '][absence_two_note]"]').val("");
                                    $('[name="list[' + id + '][absence_two_note_staff]"]').val(0);

                                    //放課後又は学級日の場合は、それぞれチェックした方にclassを付与
                                    $(this).find('[name="list[' + id + '][providing_type]"]').val(keitai).addClass("providingChecked gray");

                                    let rid = $(this).closest('tr').data('rid');
                                    let providing_type = parseInt($(`#providing${rid}`).find('.providingChecked').val());

                                    // 提供形態が放課後の場合は選択肢から区分３を削除
                                    if (setting_providing_type === PROVIDING_AFTER_SCHOOL && use_services === AFTER_SCHOOL_DAY_CARE) {

                                        $('[name="list[' + id + '][time_division]"]').find('option[value="3"]').remove();

                                    } else {

                                        if (!$(`[name="list[${id}][time_division]"]`).find('option[value="3"]').length) {
                                            $(`[name="list[${id}][time_division]"]`).append($('<option>', {
                                                value: 3,
                                                text: '区分３'
                                            }));
                                        }
                                    }

                                    // 算定区分と算定時間数をセットする
                                    setTimeDivisionTimeSetAllEdit(rid, use_services, providing_type);

                                }
                            }

                            //連動のためchangeイベントを発火
                            $(this).find('[name="list[' + id + '][e_min]"]').trigger('change');

                        } else if (obj.attend_hanei == 2) {

                            //既にあるテキストエリアは消す
                            $('[name="list[' + id + '][reason_text]"]').closest('.js_tr_area' + id).find('.tal').remove();

                            var month = getMonth();
                            let absence_times = parseInt($(this).closest('tbody').find(`#absence_times${id}`).val()) + 1;
                            var hidden = '<input type="hidden" value="2" name="list[' + id + '][attend_flg]" abs_times="' + absence_times + '">';
                            var absence_on_html = '<a href="#" class="enter red absence-on js_attend_absenceflg2"><b>欠席（' + month + '月欠席' + absence_times + '回）</b></a>';
                            var absence_reason_edit = '<div class="js_reason_div"><b>[記録者]</b>&nbsp; <span class="dib"><select class="mr10 comboBoxStaffJquery" id="js_combo' + id + '"></select>&nbsp;<select class="js_reason_staff" id="js_staff' + id + '" data-absence="1"></select></span><textarea name="list[' + id + '][reason_text]" id=' + id + ' class="form-control mt5 js_reason_text db minH14em" data-absence="1" placeholder="理由記入欄"></textarea></div>';

                            $(this).find(".enter").html(hidden + absence_on_html + absence_reason_edit);

                            $('[name="list[' + id + '][absence_note]"]').val(absence_note);
                            $('[name="list[' + id + '][absence_note_staff]"]').val(absence_note_staff);
                            $('[name="list[' + id + '][absence_click_count]"]').val(1);

                            //スタッフのプルダウン取得
                            let combo_copy = $('.comboBoxStaffJquery:first').clone();
                            let staff_copy = $('#js_setting_absence_note_staff').clone();
                            $(combo_copy).children('option').each(function (i, combo) {
                                $('#js_combo' + id).append(combo);
                            });

                            $($(staff_copy).children('option')).each(function (i, staff) {
                                $('#js_staff' + id).append(staff);
                            });
                            $('#js_combo' + id).val(0);
                            $('#js_staff' + id).val(absence_note_staff);
                            $('[name="list[' + id + '][reason_text]"]').val(absence_note);

                            // 食事提供加算用の処理
                            if (!firstLoopDone && (addingMealFlg === '1') && (meal_offer_flg === '1')) {
                                if (addingMealVal === '1') {
                                    $(this).find(".ameal .meal_btn").trigger('click');
                                }
                                $("#meal" + id + " .meal_btn").hide();
                                $("#meal" + id + " b").show();
                                firstLoopDone = true;
                            } else {
                                firstLoopDone = false;
                            }

                            // 加算実績テーブルの出欠席更新
                            $(`#js_adding_atndinfo${id}`).html('<b class="red">欠席</b>');
                            //加算のリセット処理ここに書く
                            DeleteAddingRows(id)

                        } else if (obj.attend_hanei == 3) {
                            //既にあるテキストエリアは消す
                            $('[name="list[' + id + '][reason_text]"]').closest('.js_tr_area' + id).find('.tal').remove();

                            var month = getMonth();
                            var absence_times = parseInt($(this).find(".absence-on").attr("abs_times"));
                            var hidden = '<input type="hidden" value="3" name="list[' + id + '][attend_flg]" abs_times="' + absence_times + '">';
                            var absence_on_html = '<a href="#" class="enter red absence-off js_attend_absenceflg3"><b>欠席（欠席時対応加算を取らない）</b></a>';
                            var absence_reason_edit = '<div class="js_reason_div"><b>[記録者]</b>&nbsp; <span class="dib"><select class="mr10 comboBoxStaffJquery" id="js_combo' + id + '"></select>&nbsp;<select class="js_reason_staff" id="js_staff' + id + '" data-absence="1"></select></span><textarea name="list[' + id + '][reason_text]" id=' + id + ' rows="2" class="form-control mt5 js_reason_text db minH14em" data-absence="1" placeholder="理由記入欄"></textarea></div>';
                            $(this).find(".enter").html(hidden + absence_on_html + absence_reason_edit);

                            $('[name="list[' + id + '][absence_note]"]').val(absence_note);
                            $('[name="list[' + id + '][absence_note_staff]"]').val(absence_note_staff);
                            $('[name="list[' + id + '][absence_click_count]"]').val(1);

                            //スタッフのプルダウン取得
                            let combo_copy = $('.comboBoxStaffJquery:first').clone();
                            let staff_copy = $('#js_setting_absence_note_staff').clone();
                            $(combo_copy).children('option').each(function (i, combo) {
                                $('#js_combo' + id).append(combo);
                            });

                            $($(staff_copy).children('option')).each(function (i, staff) {
                                $('#js_staff' + id).append(staff);
                            });
                            $('#js_combo' + id).val(0);
                            $('#js_staff' + id).val(absence_note_staff);
                            $('[name="list[' + id + '][reason_text]"]').val(absence_note);

                            // 食事提供加算用の処理
                            if (!firstLoopDone && (addingMealFlg === '1') && (meal_offer_flg === '1')) {
                                if (addingMealVal === '1') {
                                    $(this).find(".ameal .meal_btn").trigger('click');
                                }
                                $("#meal" + id + " .meal_btn").hide();
                                $("#meal" + id + " b").show();

                                firstLoopDone = true;
                            } else {
                                firstLoopDone = false;
                            }

                            // 加算実績テーブルの出欠席更新
                            $(`#js_adding_atndinfo${id}`).html('<b class="red">欠席（欠席時対応加算を取らない）</b>');
                            //加算のリセット処理ここに書く

                            DeleteAddingRows(id)

                        }

                    } else {

                        //出欠席をなしにした時
                        //放デイの場合は、提供形態・体温を入れられた場合
                        if (use_services == 1) {
                            if ((obj.provide_hantei > 0) || ((obj.tmpa != "9999") && (obj.tmpa_small != "9999"))) {
                                //出席にする
                                $(this).find(".attend").trigger("click");
                            }
                        } else {
                            if (((obj.tmpa != "9999") && (obj.tmpa_small != "9999"))) {
                                //出席にする
                                $(this).find(".attend").trigger("click");
                            }
                        }

                        if (obj.enter_hour_all != "9999") {
                            $(this).find('[name="list[' + id + '][s_hour]"]').val(obj.enter_hour_all);
                        } else {
                            $(this).find('[name="list[' + id + '][s_hour]"]').val(s_hour_tmp);
                        }
                        if (obj.enter_min_all !== "9999") {
                            $(this).find('[name="list[' + id + '][s_min]"]').val(obj.enter_min_all);
                        } else {
                            $(this).find('[name="list[' + id + '][s_min]"]').val(s_min_tmp);
                        }
                        //退室時
                        if (obj.leave_hour_all != "9999") {
                            $(this).find('[name="list[' + id + '][e_hour]"]').val(obj.leave_hour_all);
                        } else {
                            $(this).find('[name="list[' + id + '][e_hour]"]').val(e_hour_tmp);
                        }
                        if (obj.leave_min_all != "9999") {
                            $(this).find('[name="list[' + id + '][e_min]"]').val(obj.leave_min_all);
                        } else {
                            $(this).find('[name="list[' + id + '][e_min]"]').val(e_min_tmp);
                        }

                        //体温
                        if (obj.tmpa != "9999") {
                            $(this).find('[name="list[' + id + '][body_temp]"]').val(obj.tmpa);
                        } else {
                            $(this).find('[name="list[' + id + '][body_temp]"]').val(body_temp_tmp);
                        }
                        if (obj.tmpa_small != "9999") {
                            $(this).find('[name="list[' + id + '][body_temp_point]"]').val(obj.tmpa_small);
                        } else {
                            $(this).find('[name="list[' + id + '][body_temp_point]"]').val(body_temp_point_tmp);
                        }

                        //提供形態(放デイの場合のみ)
                        if (use_services == 1) {
                            //なしの場合はなにもしないので
                            if (obj.provide_hantei > 0) {
                                $(this).find('[name="list[' + id + '][providing_type]"]').val([obj.provide_hantei]);

                                //放課後又は学級日の場合は、それぞれチェックした方にclassを付与
                                if (obj["provide_hantei"] == 1) {
                                    $(this).find('[name="list[' + id + '][providing_type]"]:eq(0)').addClass("providingChecked gray");
                                } else if (obj["provide_hantei"] == 2) {
                                    $(this).find('[name="list[' + id + '][providing_type]"]:eq(1)').addClass("providingChecked gray");
                                }

                            } else {
                                $(this).find('[name="list[' + id + '][providing_type]"]').val([keitai]);

                                //放課後又は学級日の場合は、それぞれチェックした方にclassを付与
                                if (keitai == 1) {
                                    $(this).find('[name="list[' + id + '][providing_type]"]:eq(0)').addClass("providingChecked gray");
                                } else if (keitai == 2) {
                                    $(this).find('[name="list[' + id + '][providing_type]"]:eq(1)').addClass("providingChecked gray");
                                }
                            }
                        }
                    }

                    if ($("#js_related_class"+id).find('.js_extension').val() == 1 || $('[name="list[' + id + '][extension_flg]"]').val() == 1) {
                        ExtensionInterlockingAry[id] = {};
                        ExtensionInterlockingAry[id]['f_id'] = $('[name="list[' + id + '][f_id]"]').val();
                        ExtensionInterlockingAry[id]['c_id'] = $('[name="list[' + id + '][c_id]"]').val();
                        ExtensionInterlockingAry[id]['s_hour'] = $('[name="list[' + id + '][s_hour]"]').val();
                        ExtensionInterlockingAry[id]['s_min'] = $('[name="list[' + id + '][s_min]"]').val();
                        ExtensionInterlockingAry[id]['e_hour'] = $('[name="list[' + id + '][e_hour]"]').val();
                        ExtensionInterlockingAry[id]['e_min'] = $('[name="list[' + id + '][e_min]"]').val();
                        ExtensionInterlockingAry[id]['use_services'] = use_services;
                        ExtensionInterlockingAry[id]['extension_time_plan_flg'] = $('[name="list[' + id + '][extension_time_plan_flg]"]').val();
                        ExtensionInterlockingAry[id]['providing_type'] = $('[name="list[' + id + '][providing_type]"]:checked').val();
                    }



                    //したでthisを使うため格納する
                    var elem = $(this);
                    //実費は小細工不要
                    //そのまま来たあたいをチェックさせればいいので
                    //実費をまわしてname指定でcheck
                    $.each(obj_check, function (i, val) {
                        //実費部分
                        if (i.match(/check/)) {
                            $(elem).find("#cost" + id + "_" + val).find("input:checkbox").prop("checked", true);
                        }
                        //お弁当部分
                        if (i.match(/lunch/)) {
                            //hiddenのlunchフラグが0になっているときにtriggerさせる
                            if ($(elem).find(".lunchbtn").val() == val) {
                                $(elem).find(".lunchbtn").trigger("click");
                            }
                        }
                    });
                }
            });

            if (Object.keys(ExtensionInterlockingAry).length > 0) {
                setRelatedExtension(select_date, '', '', ExtensionInterlockingAry, 1);
            }

            //保育所等のテーブルが存在する場合
            if ($("#releasetable_hoiku").length == 1) {
                //出欠席のチェック状況をまず判定
                // if (window.innerWidth <= 768) {
                //     var element_change_hoiku = '.scrollable #releasetable_hoiku > tr';
                // } else {
                var element_change_hoiku = '#releasetable_hoiku > tr';
                // }

                $(element_change_hoiku).each(function () {
                    //参照するチェックボックスの要素を選択する
                    // if (window.innerWidth <= 768) {
                    //     var checkbox_element_hoiku = '.pinned #releasetable_hoiku > tr';
                    // } else {
                    var checkbox_element_hoiku = '#releasetable_hoiku > tr';
                    // }
                    //r_idを取得する
                    var id = $(this).data("rid");
                    if ($(checkbox_element_hoiku).find(".js_attendance_hoiku_check" + id).prop("checked") && $("[name=hoiku_attend_hanei]:checked").val()) {
                        var h_s_hour_tmp = $(this).find('[name="hoiku_list[' + id + '][hoiku_s_hour]"]').val();
                        var h_s_min_tmp = $(this).find('[name="hoiku_list[' + id + '][hoiku_s_min]"]').val();
                        var h_e_hour_tmp = $(this).find('[name="hoiku_list[' + id + '][hoiku_e_hour]"]').val();
                        var h_e_min_tmp = $(this).find('[name="hoiku_list[' + id + '][hoiku_e_min]"]').val();
                        if ($("[name=hoiku_attend_hanei]:checked").val() == 2) {
                            //キャンセル設定
                            resetHaneiHoiku(id, this);
                            $(this).find(".hoiku_absence-on").trigger("click");
                            //連動分の加算を削除
                            if ($('.js_law2024').length) {
                                DeleteAddingRows_hoiku(id);
                            }
                        } else {
                            resetHaneiHoiku(id, this);

                            $(this).find(".hoiku_attend").trigger("click");

                            if ($("#hoiku_enter_hour_all").val() != "9999") {
                                if ($("#hoiku_kaisi").prop("checked")) {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_s_hour]"]').val(parseInt($(this).closest("tr").find(".hoiku_start_hour").val()) - 1);
                                } else {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_s_hour]"]').val($("#hoiku_enter_hour_all").val());
                                }
                            } else {
                                if ($("#hoiku_kaisi").prop("checked")) {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_s_hour]"]').val(parseInt($(this).closest("tr").find(".hoiku_start_hour").val()) - 1);
                                } else {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_s_hour]"]').val(h_s_hour_tmp);
                                }
                            }
                            if ($("#hoiku_enter_min_all").val() !== "9999") {
                                if ($("#hoiku_kaisi").prop("checked")) {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_s_min]"]').val(parseInt($(this).closest("tr").find(".hoiku_start_time").val()) - 1);
                                } else {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_s_min]"]').val($("#hoiku_enter_min_all").val());
                                }
                            } else {
                                if ($("#hoiku_kaisi").prop("checked")) {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_s_min]"]').val(parseInt($(this).closest("tr").find(".hoiku_start_time").val()) - 1);
                                } else {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_s_min]"]').val(h_s_min_tmp);
                                }
                            }
                            //退室時
                            if ($("#hoiku_leave_hour_all").val() != "9999") {
                                if ($("#hoiku_owari").prop("checked")) {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_e_hour]"]').val(parseInt($(this).closest("tr").find(".hoiku_end_hour").val()) - 1);
                                } else {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_e_hour]"]').val($("#hoiku_leave_hour_all").val());
                                }
                            } else {
                                if ($("#hoiku_owari").prop("checked")) {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_e_hour]"]').val(parseInt($(this).closest("tr").find(".hoiku_end_hour").val()) - 1);
                                } else {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_e_hour]"]').val(h_e_hour_tmp);
                                }
                            }
                            if ($("#hoiku_leave_min_all").val() != "9999") {
                                if ($("#hoiku_owari").prop("checked")) {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_e_min]"]').val(parseInt($(this).closest("tr").find(".hoiku_end_time").val()) - 1);
                                } else {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_e_min]"]').val($("#hoiku_leave_min_all").val());
                                }
                            } else {
                                if ($("#hoiku_owari").prop("checked")) {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_e_min]"]').val(parseInt($(this).closest("tr").find(".hoiku_end_time").val()) - 1);
                                } else {
                                    $(this).find('[name="hoiku_list[' + id + '][hoiku_e_min]"]').val(h_e_min_tmp);
                                }
                            }
                            //連動のためchangeイベントを発火
                            $(this).find('[name="hoiku_list[' + id + '][hoiku_s_hour]"]').trigger('change');
                        }
                    }
                });
            }

        }
    });

    $('#form_id').submit(function () {
        $(".pinned").find("input").remove();
        $(".pinned").find("select").remove();
    });

    //一括リセット用
    $(document).on('click', '.allResetBtn', function () {
        if (window.confirm('現在、記録されている情報がある場合、すべてリセットされますがよろしいですか？')) {
            // if (window.innerWidth <= 768) {
            //     var element_change = '.scrollable #releasetable > tr';
            //     var element_change_hoiku = '.scrollable #releasetable_hoiku > tr';
            //     var element_change_consul = '.scrollable #releasetable_consul > tr';
            //     var element_change_plan_consul = '.scrollable #releasetable_plan_con > tr';
            // } else {
            var element_change = '#releasetable > tr';
            var element_change_hoiku = '#releasetable_hoiku > tr';
            var element_change_consul = '#releasetable_consul > tr';
            var element_change_plan_consul = '#releasetable_plan_con > tr';
            // }
            $(element_change).each(function () {
                if ($(this).find(".all_hanei_flg").prop("checked")) {
                    var id = $(this).data("rid");
                    var elem = $(this).find(".delete");
                    Success_all(elem, id, 1);
                    $('[name="list[' + id + '][reason_text]"]').closest('td').remove();
                    // if (window.innerWidth <= 768) {
                    //     //一旦この高さに調整する
                    //     $('.js_first_tr').height(50);
                    //     $('.js_second_tr').height(50);
                    // }
                }
            });
            $(element_change_hoiku).each(function () {
                if ($(this).find(".all_hanei_flg_hoiku").prop("checked")) {
                    var id = $(this).data("rid");
                    resetHaneiHoiku(id, $(this));
                    //連動分の加算を削除
                    if ($('.js_law2024').length) {
                        DeleteAddingRows_hoiku(id);
                    }
                }
            });
        }
    });
});


/**
 * 一括設定用欠席時対応加算Ⅱの表示・非表示
 */
function AllEditAbsenceTwo() {

    var attend_flg = $("[name=attend_hanei]:checked").val();
    var provide_hantei = $("[name=provide_hantei]").val();
    var omukae_flg = 0;
    var okuri_flg = 0;
    var setting_absence_two_type = 0;
    var setting_provide_attend_type = $("[name=setting_provide_attend_type]").val();

    //提供形態の表示をリセット
    $("[name=provide_hantei]").show();
    $("[name=setting_provide_attend_type]").hide();
    $("[name=setting_absence_two_type]").hide();

    if ($("#omukae").prop("checked")) {
        omukae_flg = 1;
    }

    if ($("#okuri").prop("checked")) {
        okuri_flg = 1;
    }

    var select_date = $("[name=date]").val();

    var select_date_ary = select_date.split('-');
    var startDate = new Date(select_date_ary[0], select_date_ary[1] - 1, select_date_ary[2], 0, 0, 0);
    var checkDate = new Date(2021, 3, 1, 0, 0, 0);

    //4/1以降の場合
    if (startDate >= checkDate) {

        var absence_two_none_flg = 0;
        var s_hour = check9999Val($("#enter_hour_all").val());
        var s_min = check9999Val($("#enter_min_all").val());
        var e_hour = check9999Val($("#leave_hour_all").val());
        var e_min = check9999Val($("#leave_min_all").val());

        //実績時間の差を返す
        var diff_check_time = checkAttendanceDiffTime(select_date, s_hour, s_min, e_hour, e_min);

        $("#js_setting_absence_two_note_area").closest("tr").hide();
        //文言非表示
        $('#js_absence_two_wording').hide()
        $('#js_absence_two_wording2').hide()

        //出席の場合
        if ((attend_flg == 1) && (omukae_flg == 0) && (okuri_flg == 0)) {

            //0~30分未満なら画面表示
            if ((diff_check_time < 30) && (diff_check_time != null)) {

                //令和６年法改正の前
                if ($('.js_show_absence_two_flg').val() == 1) {
                    //出席or欠席Ⅱの選択肢表示
                    $('[name=setting_provide_attend_type]').show();

                    //基本報酬を算定する場合
                    if (setting_provide_attend_type == 1) {
                        $("[name=provide_hantei]").show();
                        $("[name=setting_absence_two_type]").hide();
                    } else if (setting_provide_attend_type == 2) {
                        //欠席時対応加算Ⅱを算定する場合
                        $("[name=provide_hantei]").hide();
                        $("[name=setting_absence_two_type]").show();

                        setting_absence_two_type = $("[name=setting_absence_two_type]").val();

                        //欠席時対応加算Ⅱを算定する場合は、理由表示
                        //2022年9月リリース分にて理由を残せるように変更
                        if (setting_absence_two_type == 1 || setting_absence_two_type == 2) {
                            if (setting_absence_two_type == 1) {
                                $('#js_absence_two_wording').show();
                            } else if (setting_absence_two_type == 2) {
                                $('#js_absence_two_wording2').show();
                            }
                            $("#js_setting_absence_two_note_area").closest("tr").show();
                        }

                    } else {
                        //その他
                        $("[name=provide_hantei]").hide();
                        $("[name=setting_absence_two_type]").hide();
                    }
                }

            } else {

                //欠席時対応加算Ⅱ関連非表示フラグ
                absence_two_none_flg = 1;
            }

        } else {

            //欠席時対応加算Ⅱ関連非表示フラグ
            absence_two_none_flg = 1;
        }
    }

    return;
}


/**
 * 9999の値を消す
 * @param val
 * @returns {string}
 */
function check9999Val(val) {

    if (val == 9999) {
        val = "";
    }

    return val;
}


// 保育所等訪問支援　リセットボタン押下時
function resetHaneiHoiku(id, elem) {
    // 開始・終了時間のリセット処理
    let attend = `<td class="hoiku_enter" id="" colspan="2"><input type="hidden" value="0" name="hoiku_list[${id}][hoiku_attend_flg]"><button class="btn btn-sm hoiku_attend">開始</button><button class="btn btn-sm hoiku_absence-on">キャンセル</button></td>`;
    $(elem).find(".hoiku_enter,.hoiku_leave").remove();
    $(elem).find(".fs_list").after(attend);

    // 実費のリセット処理
    let cost = `<ul class="costRow">`;
    $(elem).find('.costRow').find('span').each(function () {
        let text = $(this).text();
        let val = $(this).data("costval");
        cost += `<li id="cost${id}_4_${val}"><label><input type="checkbox" name="hoiku_list[${id}][cost][4][${val}]" data-sid="4" value="${val}" class="checkBtn checkid_${val}"><span class="btn btn-sm cost_type" data-costval="${val}">${text.replace(/済/g, "")}</span></label></li>`;
    });
    cost += `</ul>`;

    // 実費・お弁当も初期化する
    $(elem).find('.cost').html(cost); // 実費をボタンに変更

    getCancelCountHoiku();
    return;
}


//一覧の表示順のプルダウンを変更する処理
$(function () {

    getCancelCountHoiku();

    $(document).on('click', '[name=use_services]', function () {
        var val = $(this).val();
        //選択した値が利用サービスなら
        if (val == 1) {
            $("#services_sort").show().removeClass("disable");
        } else {
            $("#services_sort").hide().addClass("disable");
        }
    });
});


/**
 * 保育所等訪問支援開始時間保存準備(一覧)
 * @param r_id     予約ID
 * @param is_mail  メール送信可否
 * @param c_id     児童ID
 * @param f_id     施設ID
 * @param attend_flg 出欠席
 * @param houmon_special_add  訪問支援員特別加算記録を連動機能
 */
function sendEnterMailHoiku(r_id, is_mail, c_id, f_id, attend_flg, houmon_special_add) {

    //メール送信時
    if (is_mail == '1') {

        //hiddenリセット
        HiddenReset();

        $('#addtend_dialog_mail').dialog('open');
        $("#hidden_attendance_type").text(1);
        $("#hidden_anther_services").text(4);
        $("#hidden_r_id").text(r_id);
        $("#hidden_is_mail").text(is_mail);
        $("#hidden_c_id").text(c_id);
        $("#hidden_f_id").text(f_id);
        $("#hidden_attend_flg").text(attend_flg);
        $("#hidden_houmon_special_add").text(houmon_special_add);
        return false;

    } else {

        var data_list = {};
        data_list["anther_services"] = 4;
        data_list["attendance_type"] = 1;
        data_list["r_id"] = r_id;
        data_list["mail_flg"] = 0;
        data_list["c_id"] = c_id;
        data_list["f_id"] = f_id;
        data_list["attend_flg"] = attend_flg;
        data_list["houmon_special_add"] = houmon_special_add;

        //メール送信しない場合は、そのまま実績登録
        AttendanceSave(data_list);
    }
}


/**
 * 保育所入室メール送信後(編集)
 * @param data
 * @param r_id
 * @param is_mail
 * @param c_id
 * @param f_id
 * @param attend_flg
 */
function SuccessHoiku(data, r_id, is_mail, c_id, f_id, attend_flg) {
    if (attend_flg == 1) {
        $("#hoiku_enter" + r_id).html("<b><span class=\"green\">" + data.time + "</span></b>");
        $("#js_adding_atndinfo" + r_id + "_hoiku").text("出席"); // 加算実績テーブルの出欠席更新

        var leave_mail = $("#hoiku_leave_mail_" + r_id).text();
        $("#hoiku_leave" + r_id).html("<button class=\"btn btn-sm\" onclick=\"sendLeaveMailHoiku(" + r_id + "," + leave_mail + "," + c_id + "," + f_id + ",4);\">終了</button>");
        // var spWidth = 768;
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        // if (width < spWidth) {
        //     $("#hoiku_leave" + r_id).css("display", "block");
        // } else {
        $("#hoiku_leave" + r_id).css("display", "table-cell");
        // }

        //メール送信用ダイアログ非表示
        $('#addtend_dialog_mail').dialog('close');

        var date = $("input[name='s_date']").val();

        //連動の調整
        //要素をloadする
        $.ajax({
            type: 'GET',
            url: 'attendance.php?mode=detail&date=' + date,
            dataType: 'html',
            success: function(data_html) {
                $('#js_adding_list' + r_id + '_hoiku').html($(data_html).find('#js_adding_list'+r_id + '_hoiku').html());
            }
        });

    } else if (attend_flg == 4) {
        $("#hoiku_leave" + r_id).html("<b><span class=\"green\">" + data.time + "</span></b>");

    } else {
        $("#hoiku_enter" + r_id).html("<b><span class=\"red\">" + data.time + "</span></b>");
        $("#js_adding_atndinfo" + r_id + "_hoiku").text("キャンセル"); // 加算実績テーブルの出欠席更新
    }
    if (data.id) {
        $("#hoiku_atnd" + r_id).html("<button class=\"btn btn-sm edit\" onclick=\"location.href='attendance.php?mode=hoiku_edit&id=" + data.id + "'\">編集</button>");
    }
    getCancelCountHoiku();
    return;
}


/**
 * 保育所等訪問支援終了時間保存準備(一覧)
 * @param r_id
 * @param is_mail
 * @param c_id
 * @param f_id
 * @param attend_flg
 * @param houmon_special_add
 */
function sendLeaveMailHoiku(r_id, is_mail, c_id, f_id, attend_flg, houmon_special_add) {

    //メールを送信する場合
    if (is_mail == '1') {

        //hiddenリセット
        HiddenReset();

        $('#addtend_dialog_mail').dialog('open');
        $("#hidden_attendance_type").text(2);
        $("#hidden_anther_services").text(4);
        $("#hidden_r_id").text(r_id);
        $("#hidden_is_mail").text(is_mail);
        $("#hidden_c_id").text(c_id);
        $("#hidden_f_id").text(f_id);
        $("#hidden_attend_flg").text(attend_flg);
        $("#hidden_houmon_special_add").text(houmon_special_add);
        return false;
    } else {

        var data_list = {};
        data_list["anther_services"] = 4;
        data_list["attendance_type"] = 2;
        data_list["r_id"] = r_id;
        data_list["mail_flg"] = 0;
        data_list["c_id"] = c_id;
        data_list["f_id"] = f_id;
        data_list["attend_flg"] = attend_flg;
        data_list["houmon_special_add"] = houmon_special_add;

        //メール送信しない場合は、そのまま実績登録
        AttendanceSave(data_list);
        return false;
    }
}


/**
 * 保育所退室メール送信後(編集)
 * @param data
 * @param r_id
 */
function SuccessHoiku_tai(data, r_id) {

    $("#hoiku_leave" + r_id).html("<b><span class=\"green\">" + data.time + "</span></b>");

    //メール送信用ダイアログ非表示
    $('#addtend_dialog_mail').dialog('close');

    //利用時間の計算
    var select_date = $("[name=date]").val();
    var select_date_ary = select_date.split('-');
    var startDate = new Date(select_date_ary[0], select_date_ary[1] - 1, select_date_ary[2], 0, 0, 0);
    var checkDate2024 = new Date(2024, 3, 1, 0, 0, 0);

    //実績時間の差を返す
    if (startDate >= checkDate2024) {
        //入室時間を空白消して取得
        var enter_time = $.trim($("#hoiku_enter"+r_id).find('span').text());
        var enter_time_ary = enter_time.split(':');
        enter_time_ary[0] = Number(enter_time_ary[0]);
        enter_time_ary[1] = Number(enter_time_ary[1]);

        //退室時間は現在時間を取得
        var now = new Date();
        var leave_time = data.time;
        var leave_time_ary = leave_time.split(':');
        leave_time_ary[0] = Number(leave_time_ary[0]);
        leave_time_ary[1] = Number(leave_time_ary[1]);

        var diff_check_time = checkAttendanceDiffTime(select_date, enter_time_ary[0], enter_time_ary[1], leave_time_ary[0], leave_time_ary[1]);

        var interval_time = '';
        var interval_time_h = parseInt(diff_check_time/60);
        if (interval_time_h) {
            interval_time = parseInt(diff_check_time/60) + '時間';
        }
        interval_time += parseInt(diff_check_time%60) + '分';

        $("#hoiku_time" + r_id).find(".js_utilization_time").text(interval_time);

        if ((diff_check_time < 30) && (diff_check_time != null)) {
            $("#hoiku_time" + r_id).addClass('thirtyTime');
        } else {
            $("#hoiku_time" + r_id).removeClass('thirtyTime');
        }
    }

    return;
}


//保育所編集画面のキャンセルでの切り替え
$(document).on('click', '[name=hoiku_attend_flg]', function () {
    if ($(this).prop("checked")) {

        // if ($('.js_law2024').length) {
        //     $('.js_attendance_time_hoiku').val('').change();
        // }

        $(this).closest("tr").next().hide();
        $(this).closest("tr").next().next().hide();
    } else {
        $(this).closest("tr").next().show();
        $(this).closest("tr").next().next().show();
    }
});


//訪問先の返却
$(document).on('change', '.js_hoiku_add_houmonsaki', function () {
    var c_id = $(this).val();
    if (c_id == 0) {
        $(".js_change_hoiku_scm_id").html('<span>※児童を選択してください。</span>');
        return false;
    }
    var date = $("[name=date]").val();
    var url = "./ajax/ajax_get_children_school.php";
    //ajaxで訪問先を取得
    $.ajax({
        url: url,
        data: {
            date: date,
            c_id: c_id
        },
        timeout: 3000,
        async: false,
        dataType: 'json',
        success: function (data) {
            $(".js_change_hoiku_scm_id").html(data);
            $('[name=hoiku_scm_id]').trigger('change');
        }
    });
});


$(document).on('change', '.js_con_add_houmonsaki', function () {
    var c_id = $(this).val();
    if (c_id == 0) {
        $(".js_change_con_scm_id").html('<span>※児童を選択してください。</span>');
        return false;
    }
    var date = $("[name=date]").val();
    var url = "./ajax/ajax_get_children_school.php";
    //ajaxで訪問先を取得
    $.ajax({
        url: url,
        data: {
            date: date,
            c_id: c_id,
            type: 'consul'
        },
        timeout: 3000,
        async: false,
        dataType: 'json',
        success: function (data) {
            $(".js_change_con_scm_id").html(data);
            $('[name=con_scm_id]').trigger('change');
        }
    });
});


//計画相談支援
$(document).on('change', '.js_plan_con_add_houmonsaki', function () {
    var c_id = $(this).val();
    if (c_id == 0) {
        $(".js_change_plan_con_scm_id").html('<span>※児童を選択してください。</span>');
        return false;
    }
    var date = $("[name=date]").val();
    var url = "./ajax/ajax_get_children_school.php";
    //ajaxで訪問先を取得
    $.ajax({
        url: url,
        data: {
            date: date,
            c_id: c_id,
            type: 'consul'
        },
        timeout: 3000,
        async: false,
        dataType: 'json',
        success: function (data) {
            $(".js_change_plan_con_scm_id").html(data);
            $('[name=con_scm_id]').trigger('change');
        }
    });
});


//訪問先の返却
$(document).on('change', '[name=hoiku_scm_id]', function () {
    if ($(this).val() == "99999") {
        $(this).next().show();
    } else {
        $(this).next().hide();
    }
});


$(document).on('change', '[name=con_scm_id]', function () {
    if ($(this).val() == "99999") {
        $(this).next().show();
    } else {
        $(this).next().hide();
    }
});

//出欠席
$(function () {
    //
    var clicks = new Array();
    clicks[0] = $("#attend_flg").val();
    $(document).on('change', '[name$="attend"]', function () {
        clicks.push($(this).val());
        $('#radio-previous').val(clicks[clicks.length - 2]);
        var prev = $('#radio-previous').val();
        var val = $(this).val();
        //現出席回数
        times_now = $(".absence_times").text();
        if (val == 2) {
            times_new = parseInt(times_now) + 1;
            $(".absence_times").html(times_new);
            // valが2のときに入力欄を空にする
            $(".js_time_set").val('');
        } else {
            if (prev == 2 && (val == 1 || val == 3)) {
                times_new = parseInt(times_now) - 1;
                if (times_new >= 0) {
                    $(".absence_times").html(times_new);
                }
                // valが3のときに入力欄を空にする
                if (val == 3) {
                    $(".js_time_set").val('');
                }
            }
        }

        //出席・欠席用項目非表示
        $("[name=absence_note]").closest('tr').hide();
        $("[name=absence_note_staff]").closest('tr').hide();
        $(".js_attendance_area").hide();

        //加算とらない場合の欠席理由を非表示
        $("[name=absence_note3]").closest('tr').hide();
        $("[name=absence_two_note2]").closest('tr').hide();
        $("[name=absence_note_staff3]").closest('tr').hide();
        $("[name=absence_two_note_staff2]").closest('tr').hide();


        // 出席の時のみ入室時間、退室時間、入室時体温を表示させる
        if (val == 1) {
            $(".js_attendance_area").show();
            $("[name=absence_two_note2]").closest('tr').hide();
            $("[name=absence_two_note_staff2]").closest('tr').hide();

            // 食事提供加算の表示
            $(".js_meal_offer").show();

        } else if (val == 2) {
            $("[name=absence_note]").closest('tr').show();
            $("[name=absence_note_staff]").closest('tr').show();

            // 食事提供加算の表示
            $(".js_meal_offer").hide();
        } else if (val == 3) {
            // 食事提供加算の表示
            $("[name=absence_note3]").closest('tr').show();
            $("[name=absence_note_staff3]").closest('tr').show();
        }

        checkAttendanceTwo();

    });
    //post用JS
    // $("#post").on('click', function () {
    //
    //     if (doCheckCSRF() == 1) {
    //
    //         $(".pinned").find($(":input")).removeAttr("name");
    //         var data = $("#form_id").serializeArray();
    //         data = parseJson(data); // 作成した以下の関数を呼び出す
    //         $("[name=json_data_list]").val(JSON.stringify(data));
    //         $("#attend_id").submit();
    //         return false;
    //
    //     } else {
    //         $(".dialogMsg").click();
    //         return false;
    //     }
    // });
    // var parseJson = function (data) {
    //     var returnJson = {};
    //     for (idx = 0; idx < data.length; idx++) {
    //         returnJson[data[idx].name] = data[idx].value;
    //     }
    //     return returnJson;
    // }

});


//post用JS
function postProcess() {
    if (doCheckCSRF() == 1) {
        $(".pinned").find($(":input")).removeAttr("name");
        var data = $("#form_id").serializeArray();
        data = parseJson(data); // 作成した以下の関数を呼び出す
        $("[name=json_data_list]").val(JSON.stringify(data));
        $("#attend_id").submit();
    } else {
        $(".dialogMsg").click();
    }
}


function parseJson(data) {
    var returnJson = {};
    for (var idx = 0; idx < data.length; idx++) {
        returnJson[data[idx].name] = data[idx].value;
    }
    return returnJson;
}


function getMonth() {
    var s_date = $("input[name='s_date']").val();
    var date = new Date(s_date);
    var month = date.getMonth() + 1;
    return month;
}


//実績の時間を変更した場合（個別編集）
$(document).on('change', '[name=s_min], [name=e_min]', function () {
    checkAttendanceTwo();

});


//欠席時対応加算Ⅱ算定設定を変更した場合（個別編集）
$(document).on('click', '[name=providing_type]', function () {

    var providing_type = $("input[name='providing_type']:checked").val();

    if (providing_type == "3") {
        $("[name=absence_two_note]").closest('tr').show();
        $("[name=absence_two_note_staff]").closest('tr').show();

        $("[name=absence_two_note2]").closest('tr').hide();
        $("[name=absence_two_note_staff2]").closest('tr').hide();

        $("[name=medical_care_basic_flg]").closest('tr').hide();
    } else if (providing_type == "4") {
        //欠席時対応加算Ⅱを算定しない
        $("[name=absence_two_note2]").closest('tr').show();
        $("[name=absence_two_note_staff2]").closest('tr').show();

        $("[name=absence_two_note]").closest('tr').hide();
        $("[name=absence_two_note_staff]").closest('tr').hide();

        $("[name=medical_care_basic_flg]").closest('tr').hide();
    } else {

        $("[name=absence_two_note]").closest('tr').hide();
        $("[name=absence_two_note_staff]").closest('tr').hide();

        $("[name=absence_two_note2]").closest('tr').hide();
        $("[name=absence_two_note_staff2]").closest('tr').hide();
        $("[name=medical_care_basic_flg]").closest('tr').show();
    }

    //算定区分の更新
    if ($('.js_law2024').length) {

        let providing_type = parseInt($(this).val());

        // 算定区分３の選択可能状態を切り替える
        toggleTimeDivisionRadioButton(providing_type);

        // 計画の算定区分、算定時間を設定
        setPlanTime(providing_type);

        $('.js_attendance_time:first').change();
    }
});


/**
 * 欠席時対応加算Ⅱ算定表示・非表示(個別編集)
 */
function checkAttendanceTwo() {
    let use_services = parseInt($('[name="use_services"]').val());
    let mode = $('[name="mode"]').val(); // 個別編集か判別するため


    var select_date = $("[name=date]").val();
// select_dateが "yyyy-mm-dd" 形式であることを確認し、時刻部分をリセットする
    var selectDateObj = new Date(select_date + 'T00:00:00');

// 比較対象の日付も時刻をリセットして生成する
    const targetDate = new Date('2024-04-01T00:00:00');
// select_dateが2024-04-01より前の日付かどうかを比較
    if (selectDateObj < targetDate) {
        // use_servicesが2の場合は対象外
        if (use_services == 2) {
            return false;
        }
    }

    var s_hour = $("[name=s_hour]").val();
    var s_min = $("[name=s_min]").val();
    var e_hour = $("[name=e_hour]").val();
    var e_min = $("[name=e_min]").val();
    var attend_flg = $('input:radio[name="attend"]:checked').val();
    var providing_type = $('input:radio[name="providing_type"]:checked').val();

    $(".js_absence_two_flg").hide();
    $("[name=absence_two_note]").closest('tr').hide();
    $("[name=absence_two_note2]").closest('tr').hide();
    $("[name=absence_two_note_staff]").closest('tr').hide();
    $("[name=absence_two_note_staff2]").closest('tr').hide();
    $("#js_providing_type_tooltip_1").show();
    $("#js_providing_type_tooltip_2").hide();

    //提供形態が放課後または学休日の場合
    if ((providing_type == 1) || (providing_type == 2)) {
        //選択された提供形態をチェックを再度行う。
        var check_providing_type = providing_type - 1;
        $('input[name=providing_type]:eq(' + check_providing_type + ')').prop('checked', true);
    } else {
        //報酬改定前は動作させる
        if (selectDateObj < targetDate) {
            $('input[name=providing_type]:eq(0)').prop('checked', true);
        }
    }

    //実績時間の差を返す
    var diff_check_time = checkAttendanceDiffTime(select_date, s_hour, s_min, e_hour, e_min);
    $("#js_edit_service_time").removeClass("red fz18").text(0);

    if (attend_flg == 1) {

        $("[name=medical_care_basic_flg]").closest('tr').show();
        $(".js_thirtyTime").removeClass("thirtyTimeBlock");

        //算定時間がnullではない場合
        if (diff_check_time != null) {

            var diff_hour = parseInt(parseInt(diff_check_time)/60);
            var diff_min = parseInt(parseInt(diff_check_time)%60);
            var diff_time = '';
            if (diff_hour) {
                diff_time = diff_hour+'時間';
            }
            diff_time += diff_min;

            $("#js_edit_service_time").text(diff_time);

            //算定時間が30分未満の場合
            if (diff_check_time < 30) {

                //退室時間欄に表示の利用時間
                $("#js_edit_service_time").addClass("red fz18");
                //30分未満文言を表示
                $(".js_thirtyTime").addClass("thirtyTimeBlock");
                if (new Date(select_date) < targetDate) {
                    $('input[name=providing_type]:eq(2)').prop('checked', true);
                }
                $("[name=absence_two_note]").closest('tr').show();
                $("[name=absence_two_note_staff]").closest('tr').show();
                $("[name=medical_care_basic_flg]").closest('tr').hide();

                //ツールチップ切り替え
                $("#js_providing_type_tooltip_1").hide();
                $("#js_providing_type_tooltip_2").show();

                //欠席として扱う選択肢を表示
                $('.js_absence_two_flg').show();

                //基本報酬を算定する・しない
                $(".js_thirtyTime_radio").show();
                if (mode === 'regist') {
                    // 加算項目の連動加算を更新
                    //欠席時対応加算Ⅱを算定する
                    if (new Date(select_date) < targetDate) {
                        $('input[name="providing_type"][value="3"]').trigger('change');
                    }
                }
            } else {
                //欠席として扱う選択肢を非表示
                $('.js_absence_two_flg').hide();

                let providing_type = $('input[name="providing_type"]:checked').val();

                // 放デイで「基本報酬を算定しない」を選択していた場合、「放課後」を選択
                if (use_services === AFTER_SCHOOL_DAY_CARE && providing_type == PROVIDING_NO_BASIC_REWARD) {
                    $('input[name="providing_type"][value="1"]').prop('checked', true);
                }

                //基本報酬を算定する・しない
                $(".js_thirtyTime_radio").hide();
            }

            if (mode === 'regist') {
                // 加算項目の連動加算を更新
                $('input[name="providing_type"][value="1"]').trigger('change');
            }

            //令和６年法改正対応
            if (new Date(select_date) >= targetDate) {

                //実利用時間算定区分
                var attend_time_div = getTimeDivision(diff_check_time);

                //計画予定時間算定区分
                var plan_time_div = '';
                if (use_services == 1) {
                    if (providing_type == 1) {
                        plan_time_div = $('.js_plan_time1_div').val();
                    } else if (providing_type == 2) {
                        if ($('.js_plan_time2_div').length) {
                            plan_time_div = $('.js_plan_time2_div').val();
                        } else {
                            plan_time_div = $('.js_plan_time1_div').val();
                        }
                    }
                } else {
                    plan_time_div = $('.js_plan_time_div').val();
                }

                if (providing_type == 1 && use_services == 1) {
                    if (attend_time_div == 3) {
                        attend_time_div = 2;
                    }
                    if (plan_time_div == 3) {
                        plan_time_div = 2;
                    }
                }

                //実績時間が30分以上あれば　算定区分を表示
                if(attend_time_div) {
                    $('.js_attend_div').html('算定区分：'+attend_time_div).show();
                } else {
                    //無ければ算定区分なし
                    $('.js_attend_div').html('算定区分：なし').show();
                }

                //算定時間数の初期化
                var time_set_val = '';

                //実利用時間算定区分が計画予定時間算定区分と一致しない場合
                if (plan_time_div && attend_time_div != plan_time_div) {

                    $('.js_plantime_area').show();

                    //算定区分数の値の設定
                    var use_plantime_flg = $('[name="use_plantime_flg"]:checked').val();

                    //30分未満の場合
                    if (diff_check_time < 30) {
                        //デフォルトを計画で算定するに設定
                        use_plantime_flg = USE_PLAN_TIME;
                        //計画時間数で算定するにラジオボタンを設定
                        $('input[name="use_plantime_flg"][value="2"]').attr('checked', 'checked');
                    }

                    if (use_plantime_flg == 1) {

                        //実績時間で算定するかつ、30分未満の場合
                        if(diff_check_time < 30){
                            $('input.js_time_division[type="radio"]').prop('checked', false);
                        }else{
                            //実績時間で算定する場合、実績時間が30分以上の場合
                            $('input.js_time_division[type="radio"][value="' + attend_time_div + '"]').prop('checked', true);
                        }

                        time_set_val = diff_check_time;

                    //計画時間で算定する場合
                    }else if (use_plantime_flg == 2) {
                        $('input.js_time_division[type="radio"][value="' + plan_time_div + '"]').prop('checked', true);
                        time_set_val = $('.js_plan_time_val').val();
                    // 例外　重心の時
                    } else {
                        if ($('.js_plan_time_val').val()) {
                            time_set_val = $('.js_plan_time_val').val();
                        } else {
                            time_set_val = diff_check_time;
                        }
                    }
                } else {
                    //計画と実績が一致する場合
                    $('.js_plantime_area').hide();
                    $('input.js_time_division[type="radio"][value="' + attend_time_div + '"]').prop('checked', true);

                    // 別表の提供時間があっても支援時間区分が入っていない場合がある為、その場合は実績を使用
                    if (plan_time_div && $('.js_plan_time_val').val()) {
                        time_set_val = $('.js_plan_time_val').val();
                    } else {
                        time_set_val = diff_check_time;
                    }

                    //実績時間で算定するかつ、30分未満の場合
                    if (time_set_val < 30) {
                        $('input.js_time_division[type="radio"]').prop('checked', false);
                    }
                }

                //算定時間数の値を設定nullだけ通さない(0は通る)
                if ($('.js_time_set').length) {

                    //算定時間数の値をリセット
                    $('.js_time_set').val('');

                    if(time_set_val){
                        var time_set = getTimeSet(time_set_val);
                        $('.js_time_set').val(time_set);

                    }
                }
            }
        } else {
            //令和６年法改正対応
            if (new Date(select_date) >= targetDate) {
                $('.js_plantime_area').hide();
                $('.js_attend_div').html('');
            }
        }
    } else {
        //令和６年法改正対応
        if (new Date(select_date) >= targetDate) {
            $('.js_plantime_area').hide();
            $('.js_attend_div').html('');
        }
    }

    //延長支援加算の連動ここから
    //入室時間または、退室時間、提供形態があるかを判断して接続する
    if (use_services === AFTER_SCHOOL_DAY_CARE) {
        if (!s_hour || !s_min || !e_hour || !e_min || !providing_type) {
            return false;
        }
    }
    if (use_services === CHILD_DEVELOPMENT_SUPPORT) {
        if (!s_hour || !s_min || !e_hour || !e_min) {
            return false;
        }
    }



    //formを配列として初期か
    var form = {};
    form.s_hour = s_hour;
    form.s_min = s_min;
    form.e_hour = e_hour;
    form.e_min = e_min;
    form.attend_flg = attend_flg;
    form.providing_type = providing_type;
    form.use_services = use_services;

    //保育所の場合はここより先不要なのでreturn
    if ($("[name=mode]").val() == "hoiku_regist") {
        return false;
    }

    var url = "./ajax/ajax_extension.php";
    var c_id = $("[name=c_id]").val();
    var f_id = $("[name=f_id]").val();
    var date = $("[name=date]").val();
    $.ajax({
        type: 'post',
        url: url,
        timeout: 12000,
        dataType: 'json',
        data: {
            "mode": "edit",
            "date": date,
            "c_id": c_id,
            "f_id": f_id,
            "form": form

        },
        success: function (data) {

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log("XMLHttpRequest : " + XMLHttpRequest.status);
            console.log("textStatus     : " + textStatus);
            console.log("errorThrown    : " + errorThrown.message);
            alert("通信に失敗しました。");
        }
    });
}


/**
 * 実績時間の差を返す(各画面)
 * @param select_date
 * @param s_hour
 * @param s_min
 * @param e_hour
 * @param e_min
 * @returns {null}
 */
function checkAttendanceDiffTime(select_date, s_hour, s_min, e_hour, e_min) {

    var check_date1 = 0;
    var check_date2 = 0;
    var diff_check_time = null;
    var select_date_ary = select_date.split('-');

    if ($.isNumeric(s_hour) && (s_hour >= 0) && $.isNumeric(s_min) && (s_min >= 0)) {
        var date1 = new Date(select_date_ary[0], select_date_ary[1], select_date_ary[2], s_hour, s_min, 0);
        check_date1 = date1.getTime();
    }

    if ($.isNumeric(e_hour) && (e_hour >= 0) && $.isNumeric(e_min) && (e_min >= 0)) {
        var date2 = new Date(select_date_ary[0], select_date_ary[1], select_date_ary[2], e_hour, e_min, 0);
        check_date2 = date2.getTime();
    }

    if ((check_date1 <= check_date2) && (check_date1 > 0) && (check_date2 > 0)) {
        var diff = check_date2 - check_date1;
        diff_check_time = Math.abs(diff) / (60 * 1000);
    }

    return diff_check_time;

}


//出席表施設プルダウン用js
$(document).on('change', '.facility', function () {
    if ($('.facility option:selected').hasClass('consul')) {
        $('.noConsul').hide();
    } else {
        $('.noConsul').show();
    }
});


/** 並び替えのスマホ処理 **/
$(function () {
    // if (window.innerWidth <= 768) {
    //
    //     var sort_service = $(".js_sort_service");
    //     //サービスでクリックした時
    //     $(sort_service).on("click", function () {
    //         if ($(this).hasClass('headerSortDown')) {
    //             //昇順
    //             var sort = 1;
    //         } else {
    //             //降順
    //             var sort = 0;
    //         }
    //         $.when(
    //             $(this).closest('div').next().find(".tablesorter").tablesorter({
    //                 sortList: [
    //                     [2, sort]
    //                 ],
    //                 widgets: ["zebra"]
    //             })
    //         ).done(function () {
    //             setTimeout(function () {
    //                 $('.pinned .sortTable01 .js_attend_count').each(function (i) {
    //                     i++;
    //                     $(this).text(i);
    //                 })
    //             }, 200);
    //         })
    //     })
    // }
});


$(document).ready(function () {
    // ラジオボタンの変更を監視
    $('.js-tableChange').change(function () {
        var selectedValue = $(this).val(); // 選択されたラジオボタンのvalue属性の値を取得
        var parentDiv = $(this).closest('.ibox-inner'); // ラジオボタンの最も近い親のdiv要素を取得

        // すべての要素を非表示にする
        parentDiv.find('.js-stableChangeCont01, .js-stableChangeCont02').css('display', 'none');

        // 選択されたvalue属性に応じて要素を表示
        if (selectedValue === '1') {
            parentDiv.find('.js-stableChangeCont01').css('display', 'table-cell');
            parentDiv.find('h4.pickCaption').css('background', '#2195cb');
            parentDiv.find('table thead th').css('background', '#dcf4ff');
            // すべての要素の背景色をアニメーションで変更
            parentDiv.find('td.js-stableChangeCont01').animate({ backgroundColor: '#ffe695' }, 800, function () {
                // アニメーションが完了したら元の背景色に戻す
                $(this).animate({ backgroundColor: 'transparent' }, 800);
            });

            //操作オプションんの表示
            $("#inputValue").show();
            $("#inputAdding").hide();
        } else if (selectedValue === '2') {
            parentDiv.find('.js-stableChangeCont02').css('display', 'table-cell');
            parentDiv.find('h4.pickCaption').css('background', '#6abb14');
            parentDiv.find('table thead th').css('background', '#eeffdb');
            // すべての要素の背景色をアニメーションで変更
            parentDiv.find('td.js-stableChangeCont02').animate({ backgroundColor: '#ffe695' }, 800, function () {
                // アニメーションが完了したら元の背景色に戻す
                $(this).animate({ backgroundColor: 'transparent' }, 800);
            });

            $("#inputValue").hide();
            $("#inputAdding").show();
        }
    });

    // 初期状態で選択されているラジオボタンに基づいて要素を表示
    var initiallySelectedRadioButton = $('.js-tableChange:checked');
    if (initiallySelectedRadioButton.length > 0) {
        const selectedValue = initiallySelectedRadioButton.val();
        if (selectedValue === '1') {
            $('.js-stableChangeCont01').css('display', 'table-cell');
            $("#inputValue").show();
            $("#inputAdding").hide();
        } else if (selectedValue === '2') {
            $('.js-stableChangeCont02').css('display', 'table-cell');
            $("#inputValue").hide();
            $("#inputAdding").show();
        }
    }
});


// 出席表一括編集の出席・加算実績ボタン押下時の切り替え処理
$(document).ready(() => {
    // テーブル表示を切り替える関数
    function toggleTableDisplay(radioButton) {
        const selectedValue = radioButton.val();
        const parentBox = radioButton.closest('.ibox-inner');

        if (selectedValue === '1') { // 出席実績を表示し、加算実績を非表示
            parentBox.find('.attendanceList').show();
            parentBox.find('.addingList.addingListTable').hide();
            parentBox.find('h4.pickCaption').css('background', '#2195cb');
            parentBox.find('table thead th').css('background', '#dcf4ff');
        } else if (selectedValue === '2') { // 加算実績を表示し、出席実績を非表示
            parentBox.find('.addingList.addingListTable').show();
            parentBox.find('.attendanceList').hide();
            parentBox.find('h4.pickCaption').css('background', '#6abb14');
            parentBox.find('table thead th').css('background', '#eeffdb');
        }
    }

    // 画面表示時に各ラジオボタンに対して処理を実行
    $('.js-tableChange:checked').each(function () {
        toggleTableDisplay($(this));
    });

    // ラジオボタン変更時の処理
    $('.js-tableChange').on('change', (event) => {
        toggleTableDisplay($(event.currentTarget));
    });
});


// 加算の連動機能（一括編集、一括反映で使用）
function updateAddingRows(id) {
    const $attend = $(`#js_related_class${id}`);

    // 加算項目のアカウント権限の有無チェック
    let editFlg = $attend.hasClass('js_no_edit_adding') ? 0 : 1;

    const conditions = [
        { flag: '.js_support_required_flg', value: '37', name: '個別サポート加算(Ⅰ)' },
        { flag: '.js_need_protection_flg', value: '38', name: '個別サポート加算(Ⅱ)' },
        { flag: '.js_school_refusal_support_flg', value: '53', name: '個別サポート加算(Ⅲ)' },
        { flag: '.js_strength_action_flg', value: '9', name: '強度行動障害児支援加算' },
        { flag: '.js_special_support_add', value: '7', name: '特別支援加算' }
    ];

    let newRows = [];
    let allFlagsZero = true;

    conditions.forEach(condition => {
        // 各加算を登録するための連動機能フラグが１の場合の処理
        if ($attend.closest('tbody').find(condition.flag).val() === '1') {
            // 連動対象加算が、加算項目内に選択状態に無い場合
            if ($attend.find(`select[name$='[${condition.value}][selected_content]']`).length === 0) {
                let newRow = $attend.find('.js_adding_tr').first().clone();
                allFlagsZero = false;

                newRow.find('th, .red, .orang, .js_clone_obj, .js_reset_clone_obj').remove();
                newRow.find('input, select').val('');
                newRow.find('input[type="text"].newDatePickerJs').each(function () {
                    $(this).removeAttr('id').removeClass('hasDatepicker');
                    $(this).datepicker();
                });
                newRow.find('.js_hidden_content, .hissu_ad').hide();

                //該当連動加算の選択肢を追加する
                newRow.find('.js-selected-adding-all').append('<option value="' + condition.value + '">' + condition.name + '</option>')

                newRow.find('.js-selected-adding-all').val(condition.value).trigger('change');

                // nameも連動加算選択状態へ更新
                if (!$('.js_law2024').val()) {
                    handleSelectedAddingChange(condition.value, newRow);
                }

                newRows.push(newRow);
            }
        }
    });

    // 各加算を登録するための連動機能フラグが1つも無い場合、行の追加をスキップ
    if (allFlagsZero) {
        return; // 処理を中断
    }

    // 重心フラグの格納（後のエラーチェックで使用）
    let severe_only_flg = $attend.find('.js_severe_only_flg').val();

    newRows.forEach(newRow => {
        $attend.find('.js_adding_tr').last().after(newRow);

        let errorMessage;
        // 追加された加算項目の要素と選択加算の値を取得
        let newTd = newRow.find('td').first();
        let selectedValue = newTd.find(".js-selected-adding-all").val();

        // 同一事業所番号の施設で同一の加算登録がある場合の施設名取得
        let some_facility = $attend.find(".js_some_facility_" + selectedValue).val();

        // エラーメッセージ格納
        if (some_facility) {
            errorMessage = `<p class="red err kaisu">▼同一事業所番号の施設（${some_facility}）で、同日に算定しているため登録できません。</p>`;

        } else if (severe_only_flg === '1') { // 重心フラグがある場合
            if (selectedValue === '37') {
                errorMessage = `<p class="red err kaisu">▼重心型の事業所を利用する重症心身障害児は、個別サポート加算（Ⅰ）の算定ができません。</p>`;
                // } else if (selectedValue === '9') {
                //     errorMessage = `<p class="red err kaisu">▼重心型の事業所を利用する重症心身障害児は、強度行動障害児支援加算の算定ができません。</p>`;
            }
        }

        // エラーメッセージがあればクローンされた行へ挿入
        if (errorMessage) {
            let $addingButtonTd = newTd.closest('tr').find('td.js_adding_button').first();
            $addingButtonTd.prepend(errorMessage);
        }

    });

    const firstSelectedAdding = $attend.find('.js-selected-adding-all').first();

    if (!firstSelectedAdding.val()) {
        const $clonedTr = $attend.find('tr.js_adding_tr').first().clone();
        const $clonedResetTr = $attend.find('tr.js_adding_tr').first().find(".js_reset_clone_obj").clone();

        $clonedTr.children().filter(':not(.js_clone_obj)').remove();
        $attend.find('tr').first().remove();

        const $clonedObj = $clonedTr.find('.js_clone_obj');
        $($clonedObj.get().reverse()).each(function () {
            $(`#js_related_class${id}`).find('tr').first().prepend($(this).clone());
        });
        $(`#js_related_class${id}`).find('tr').first().append($clonedResetTr);
    }

    const trNum = $attend.find('tr').length;
    $attend.find(".js_clone_obj, .js_reset_clone_obj").attr("rowspan", trNum);

    if (editFlg !== 0) { // 加算項目のアカウント権限がある場合のみ加算項目にボタンを追加する
        if (!$('.js_law2024').val()) {
            updateAddingTbodyTrButtons($(`#js_related_class${id}`));
        }
    }

}


// 加算の連動リセット機能（一括編集、一括反映で使用）
function DeleteAddingRows(id) {
    // 加算項目のアカウント権限の有無チェック
    let editFlg = $('#js_related_class' + id).hasClass('js_no_edit_adding') ? 0 : 1;

    //追加分（消してもらって構いません）
    //令和6年4月法改正前か後か判断するため、表示画面から現在年月日を取得
    let dateValue = $('input[name="date"]').val();
    let currentDate = new Date(dateValue);
    let date202404 = new Date('2024-04-01');

    let selectedValues;
    if (currentDate >= date202404) {
        //令和6年4月法改正の連動加算
        selectedValues = [37, 38, 3, 9, 53, 71];
    } else {
        //令和6年4月法改正以前の連動加算
        selectedValues = [37, 38, 7, 9];
    }
    //ここまで

    //加算の連動処理ここにかく、指定の加算は削除する
    $('#js_related_class' + id).find(".js-selected-adding-all").each(function () {
        const selected = $(this).val();
        if (selectedValues.includes(parseInt(selected))) {
        // if (selected == 37 || selected == 38 || selected == 7 || selected == 9) {　//もともとの処理
            $(this).closest('tr').find('.js_delete').click();
            // この要素の親のtrを取得
            let $target = $(this).closest('tr');

            // エラーを削除
            $target.find('.js_adding_button .err').remove();

            // nameも加算未選択状態へ更新
            $target.find('input, select, input[type="text"], .newDatePickerJs').each(function () {
                const nameAttr = $(this).attr('name');
                if (nameAttr) {
                    // name属性を分割して、特定の部分を書き換え
                    const nameParts = nameAttr.split('][');
                    if (nameParts.length >= 2) {
                        nameParts[1] = ''; // 第二要素を空にする
                        const newNameAttr = nameParts.join('][');
                        $(this).attr('name', newNameAttr);
                    }
                }
            });
        }

        //家庭連携加算の欠席警告エラーの削除
        if (selected == 1) {
            $(this).closest('tr').find('.kesseki').remove();
        }

    });

    //すべてのプルダウンがからかどうかを判定する
    //空の場合は一番最初のjs-selected-addingのtr残して他のjs-selected-addingの親のtrを削除する
    //空でない場合はからのプルダウンの親要素を削除する
    var $selectedAdding = $('#js_related_class' + id).find(".js-selected-adding-all");
    // 最初のjs-selected-addingの値を取得
    var firstValue = $selectedAdding.first().val();

    // すべてのプルダウンが空の場合
    if ($selectedAdding.filter(function () {
        return this.value !== '';
    }).length === 0) {
        // 最初の要素以外を削除
        $selectedAdding.slice(1).closest('tr').remove();
    } else {
        // 最初の要素以外で値が空の要素を削除
        $selectedAdding.slice(1).filter(function () {
            return this.value === '';
        }).closest('tr').remove();
    }

    // 削除後の加算項目の数を取得
    let after_selectedAdding = $('#js_related_class' + id).find(".js-selected-adding-all");

    // 加算項目の追加ボタンのみ配置されない場合がある為、加算項目が一つの場合はボタン再設置
    if (($('.js_law2024').val() == 1) && (after_selectedAdding.length === 1)) {
        let row = $selectedAdding.closest('tr');
        let addingButtonContainer = row.find('.js_adding_button');

        let no_display = '';
        if (editFlg === 0) {
            // 加算項目管理の編集権限が無い場合は、加算の追加、削除ボタンを非表示へ
            no_display = 'style="display:none;"';
        }

        // 既存のボタンをリセット
        addingButtonContainer.empty();

        // 加算項目のフォーム出し入れ用の要素を設置
        addingButtonContainer.append('<span class="js_adding_relation"></span>');

        // 追加ボタンを設置
        addingButtonContainer.append(`<button type="button" class="btn btn-sm add js_add" ${no_display}>追加</button>`);
        // 削除ボタンを設置
        addingButtonContainer.append(`<button type="button" class="btn btn-sm delete js_delete" ${no_display}>削除</button>`);
    }

    // rowspan更新
    const tr_num = $('#js_related_class' + id).find('tr').length;
    $('#js_related_class' + id).find('tr:first').find('td:not(.js_adding_td)').attr('rowspan', tr_num);

    // 欠席時対応加算エラーチェック
    let target = $('js_related_class').find('tr').first();

    if (!$('.js_law2024').val()) {
        checkHomeAddingError(".js-selected-adding-all", target);
    }

    if (editFlg !== 0) { // 加算項目のアカウント権限がある場合のみ加算項目にボタンを追加する
        // 行の追加後にボタンの状態を更新
        if (!$('.js_law2024').val()) {
            updateAddingTbodyTrButtons($("#js_related_class" + id))
        }
    }

}


//保育所用
// 加算の連動リセット機能（一括編集、一括反映で使用）
function DeleteAddingRows_hoiku(id) {

    let selectedValues;
    selectedValues = [64, 67];

    var rid_hoiku_obj = $('.attendanceListTable3').next().find('#js_related_class' + id);

    //加算の連動処理ここにかく、指定の加算は削除する
    $(rid_hoiku_obj).find(".js-selected-adding-all").each(function () {
        const selected = $(this).val();
        if (selectedValues.includes(parseInt(selected))) {
            $(this).closest('tr').find('.js_delete').click();
            // この要素の親のtrを取得
            let $target = $(this).closest('tr');

            // エラーを削除
            $target.find('.js_adding_button .err').remove();

            // nameも加算未選択状態へ更新
            $target.find('input, select, input[type="text"], .newDatePickerJs').each(function () {
                const nameAttr = $(this).attr('name');
                if (nameAttr) {
                    // name属性を分割して、特定の部分を書き換え
                    const nameParts = nameAttr.split('][');
                    if (nameParts.length >= 2) {
                        nameParts[1] = ''; // 第二要素を空にする
                        const newNameAttr = nameParts.join('][');
                        $(this).attr('name', newNameAttr);
                    }
                }
            });
        }
    });

    //すべてのプルダウンがからかどうかを判定する
    //空の場合は一番最初のjs-selected-addingのtr残して他のjs-selected-addingの親のtrを削除する
    //空でない場合はからのプルダウンの親要素を削除する
    var $selectedAdding = $(rid_hoiku_obj).find(".js-selected-adding-all");
    // 最初のjs-selected-addingの値を取得
    var firstValue = $selectedAdding.first().val();

    // すべてのプルダウンが空の場合
    if ($selectedAdding.filter(function () {
        return this.value !== '';
    }).length === 0) {
        // 最初の要素以外を削除
        $selectedAdding.slice(1).closest('tr').remove();
    } else {
        // 最初の要素以外で値が空の要素を削除
        $selectedAdding.slice(1).filter(function () {
            return this.value === '';
        }).closest('tr').remove();
    }

    // rowspan更新
    const tr_num = $(rid_hoiku_obj).find('tr').length;
    $(rid_hoiku_obj).find(".js_clone_obj,.js_reset_clone_obj").attr("rowspan", tr_num);
}


function setAddingRelated(data, date) {
    const rid = data.r_id;
    $.ajax({
        type: 'GET',
        url: 'attendance.php?mode=detail&date=' + date,
        dataType: 'html',
        success: function(data) {
            $('#js_adding_list' + rid).html($(data).find('#js_adding_list'+rid).html());
        }
    });
}


//延長支援連動確認
function setRelatedExtension(date, c_id, f_id, form_ary, all_edit_setting) {

    var select_date_ary = date.split('-');
    var startDate = new Date(select_date_ary[0], select_date_ary[1] -1, select_date_ary[2], 0, 0, 0);
    // 2024年度法改正チェック日付
    let checkDate2024 = new Date(2024, 3, 1, 0, 0, 0);

    // 2024/04以降のみ連動の表示をするので日付判定
    if (startDate >= checkDate2024) {

        //延長支援加算の連動ここから
        var url = "./ajax/ajax_extension.php";

        $.ajax({
            type: 'post',
            url: url,
            timeout: 12000,
            dataType: 'json',
            data: {
                "mode": (all_edit_setting === 1) ? 'all_edit_setting' : "ajax_detail",
                "date": date,
                "c_id": c_id,
                "f_id": f_id,
                "form": form_ary,
            },
            success: function (data) {

                // 一括設定からの反映の場合
                if (all_edit_setting === 1) {
                    // 延長支援時間が取得出来た場合
                    if (data) {
                        // ダイアログ表示必要児童のrid用配列
                        let modal_data = [];

                        // ダイアログ表示不要児童のrid用配列
                        let nomodal_data = [];

                        // 別表の延長支援時間未登録の児童用配列（体制等で登録無くとも連動する場合のみ格納）
                        let extension_no_plan_time_ary = [];
                        // 延長支援時間が30分以上1時間未満の場合でも連動する児童用配列（体制等で連動する場合のみ格納）
                        let extension_30min_1hour_ary = [];

                        // 延長支援の連動設定に基づいて取得した延長支援情報を編集
                        // 取得した延長支援時間情報でループ
                        $.each(data, function(key, value) {
                            // 別表の延長支援時間の有無を格納
                            let extension_time_plan_flg = $(`[name="list[${key}][extension_time_plan_flg]"]`).val() ? 1 : 0;
                            // 選択している提供形態取得
                            let providing_type = parseInt(form_ary[key]['providing_type']);

                            // 平日学休日の場合且つ、平日学休日の延長支援時間の設定がある場合はフラグを書き換える
                            const extension_time_plan_holiday_flg = (parseInt($(`[name="list[${key}][extension_time_plan_holiday_flg]"]`).val()) === 1) ? 1 : 0;
                            if (providing_type === PROVIDING_SCHOOL_HOLIDAYS && IS_HOLIDAY === false) {
                                extension_time_plan_flg = extension_time_plan_holiday_flg;
                            }

                            // 延長支援加算の連動設定（別表の有無で連動、延長支援時間30~60分の連動）
                            let extension_no_plan_time = $(`[name="list[${key}][extension_support_no_plan_time]"]`).val();
                            let extension_30min_1hour = $(`[name="list[${key}][extension_30min_1hour]"]`).val();

                            // 別表の延長支援時間がない場合（体制等）
                            if (!extension_time_plan_flg) {
                                if (parseInt(extension_no_plan_time) === 3) {
                                    // 連動しない場合は対象のキーのdataを削除
                                    delete data[key];

                                    // 次の条件文へ（data削除した場合次の条件を通さない為）
                                    return true;
                                } else if (parseInt(extension_no_plan_time) === 2) {
                                    // 確認必用な場合はダイアログ用に対象のキーと値を配列へ格納
                                    extension_no_plan_time_ary[key] = 1;
                                }
                            }

                            // 延長支援時間が30分以上1時間未満の場合（体制等）
                            if (value["10"]) {
                                if (parseInt(extension_30min_1hour) === 2) {
                                    // 連動しない場合は対象のキーのdataを削除
                                    delete data[key];
                                } else if (parseInt(extension_30min_1hour) === 1) {
                                    // 確認必用な場合はダイアログ用に対象のキーと値を配列へ格納
                                    extension_30min_1hour_ary[key] = 1;
                                }
                            }
                        });

                        // 一括反映した児童情報でループ
                        $.each(form_ary, function(r_key, r_val) {
                            if (extension_no_plan_time_ary[r_key] || extension_30min_1hour_ary[r_key]) {
                                // ダイアログ表示用配列へ、連動設定の条件に適している児童様を配列へ追加
                                modal_data.push(r_key);
                            } else {
                                // 別表があって延長支援時間が1時間以上の場合 or 別表が無くて体制等で別表なくても連動する設定の場合
                                $('.js_children_area'+r_key).find('.js_utilization_time').parent().addClass('extraTime');
                                nomodal_data.push(r_key);
                            }
                        })

                        // ダイアログに確認必要な児童名を表示する
                        if (!$.isEmptyObject(data) && modal_data.length) {
                            // 延長支援時間情報が存在し、ダイアログ表示配列に値が入っている場合実行
                            $('#extension_dialog_allSetBtn').dialog({
                                autoOpen: false, // 自動でオープンしない
                                width: 'auto', // 横幅のサイズを設定
                                modal: true, // モーダル表示する

                                resizable: false, // リサイズしない
                                draggable: false, // ドラッグしない
                                // show: "clip",     // 表示時のエフェクト
                                hide: "fade", // 非表示時のエフェクト
                                buttons: [
                                    //　モーダル初期設定
                                    {
                                        text: '延長支援加算を算定する',
                                        click: function () {
                                            var data_ary = [];
                                            $('.js_r_id').each(function () {
                                                if ($(this).prop('checked')) {
                                                    $('.js_children_area'+$(this).val()).find('.js_utilization_time').parent().addClass('extraTime');
                                                    //算定するフラグをリセットする
                                                    $('[name="list['+$(this).val()+'][extension_calcu_flg]"]').val('');
                                                } else {
                                                    // チェックない場合は算定しないフラグをセット
                                                    $('[name="list['+$(this).val()+'][extension_calcu_flg]"]').val(2);
                                                    // 該当のdataを削除
                                                    delete data[$(this).val()];
                                                }
                                                // チェック関係なく全員分の情報を格納
                                                data_ary.push($(this).val());
                                            });

                                            // チェックの有無で加算の選択状態、フラグの操作実行
                                            if (data_ary.length) {
                                                doUpdateExtension(data_ary, data);
                                            }

                                            $(this).dialog("close");
                                        }
                                    },
                                    {
                                        text: 'キャンセル',
                                        click: function () {
                                            var data_ary = [];
                                            $('.js_r_id').each(function () {
                                                if ($(this).prop('checked')) {
                                                    // 延長支援加算の要素があれば削除する
                                                    var this_rid = $(this).val();
                                                    if ($('[name="adding['+form_ary[this_rid]['c_id']+'][3][selected_content]"]').length) {
                                                        $('[name="adding['+form_ary[this_rid]['c_id']+'][3][selected_content]"]').closest('tr').find('.js_delete').click();
                                                    }

                                                    $('.js_children_area'+this_rid).find('.js_utilization_time').parent().removeClass('extraTime');
                                                    //算定しないフラグ
                                                    $('[name="list['+this_rid+'][extension_calcu_flg]"]').val(2);
                                                }
                                            });

                                            $(this).dialog("close");
                                        }
                                    }
                                ],
                                open: function() {
                                    // ダイアログが開いたときはチェックボックス全て未選択なので、「延長支援加算を算定する」ボタンを無効化しておく
                                    let buttons = $(this).dialog("widget").find(".ui-dialog-buttonpane button");
                                    $(buttons[0]).addClass("ui-state-disabled").prop("disabled", true); // ボタンをスタイル上で非活性化
                                }
                            });

                            // 画面に表示されている児童のリストを取得（並び変え用）
                            let reference_array  = [];
                            $('#releasetable .js_first_tr').each(function() {
                                reference_array .push($(this).attr('data-rid')); // data-ridの値を取得し、配列に追加
                            });

                            // ダイアログに表示する児童情報を一括画面の並びと同じように並び変える
                            // 1つ目の配列に基づいて並び替えを実行
                            let sorted_array = reference_array.filter(id => modal_data.includes(String(id)));

                            // ダイアログ用の児童と延長支援情報用
                            let realname_html = "";

                            // 並び替え後のダイアログ表示児童様情報でループ
                            $.each(sorted_array, function(r_key, r_val) {
                                // 延長支援情報用
                                let html_extension_time = '';

                                // 延長支援時間1がある場合
                                if (data[r_val]['start_time']) {
                                    html_extension_time = "時間1：" + data[r_val]['start_time'] + '～' + data[r_val]['end_time'] +"（" + data[r_val]['time1'] +"分）";
                                }
                                // 延長支援時間2がある場合
                                if (data[r_val]['start_time_2']) {
                                    html_extension_time += "　時間2：" + data[r_val]['start_time_2'] + '～' + data[r_val]['end_time_2'] +"（" + data[r_val]['time2'] +"分）";
                                }

                                // 別表の延長支援時間の登録無い場合はその旨赤文字として追加
                                let html_extension_time_no_plan = '';
                                if (extension_no_plan_time_ary[r_val]) {
                                    html_extension_time_no_plan = "<b class=\"red\">【計画なし】</b>";
                                }

                                // ダイアログ用に児童名と延長支援情報をくっつける
                                realname_html += "<p><label class=\"checkbox05\"><input type=\"checkbox\" value=\""+r_val+"\" class=\"js_r_id\"><span>" + $('[name="list['+r_val+'][realname]"]').val() + "［"+html_extension_time+"］"+html_extension_time_no_plan+"</span></label></p>";
                            })

                            // 条件に基づいてダイアログ用メッセージを設定
                            let dialog_message = '';
                            if (Object.keys(extension_no_plan_time_ary).length && Object.keys(extension_30min_1hour_ary).length) {
                                dialog_message = '支援計画に延長支援時間の記載がない、または延長支援時間が30分以上、1時間未満になっています。';
                            } else if (Object.keys(extension_no_plan_time_ary).length) {
                                dialog_message = '支援計画に延長支援時間の記載がありません。';
                            } else if (Object.keys(extension_30min_1hour_ary).length) {
                                dialog_message = '延長支援時間が30分以上、1時間未満になっています。';
                            }

                            // ダイアログへメッセージと児童と延長支援時間情報を挿入
                            $('#extension_dialog_allSetBtn').find(".js_realname").html(realname_html);
                            $('#extension_dialog_allSetBtn').find(".error-title").html(`<i class="fa fa-exclamation-triangle mr5"></i>${dialog_message}`);

                            $('#extension_dialog_allSetBtn').dialog('open');
                        }

                        // ダイアログなしで算定する場合は選択児童の延長支援加算を選択状態にする
                        if (nomodal_data.length) {
                            doUpdateExtension(nomodal_data, data);
                        }

                    } else {
                        $.each(form_ary, function(r_key, r_val) {
                            // 延長支援加算の要素があれば削除する
                            if ($('[name="adding['+r_val['c_id']+'][3][selected_content]"]').length) {
                                $('[name="adding['+r_val['c_id']+'][3][selected_content]"]').closest('tr').find('.js_delete').click();
                            }

                            $('.js_children_area'+r_key).find('.js_utilization_time').parent().removeClass('extraTime');
                            //算定しないフラグ
                            $('[name="list['+r_key+'][extension_calcu_flg]"]').val(2);
                        })
                    }

                } else {
                    //個別編集画面のフラグ
                    let single_flg = $('.edit_single_flg').val();
                    if (single_flg) {
                        // 取得情報から延長支援加算の警告文を表示
                        handleExtensionSupportDisplay(data);
                    }
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("XMLHttpRequest : " + XMLHttpRequest.status);
                console.log("textStatus     : " + textStatus);
                console.log("errorThrown    : " + errorThrown.message);
                alert("通信に失敗しました。");
            }
        });
    }
}


//延長支援連動
$(function () {

    //放課後と学休日が押されたら、延長支援加算との連動
    //対象画面：一括編集
    $(document).on("change", "[name*=\\[providing_type\\]]", (function () {

        //延長支援の連動処理
        if ($('.js_law2024').val()) {

            //idを取得する
            var id = getRid(this);

            //利用サービス
            var use_services = $('[name="list[' + id + '][use_services]"]').val();

            let childId = $(`[name="list[${id}][c_id]"]`).val();
            var select_date = $("[name=date]").val();
            var s_hour = $('[name="list[' + id + '][s_hour]"]').val();
            var s_min = $('[name="list[' + id + '][s_min]"]').val();
            var e_hour = $('[name="list[' + id + '][e_hour]"]').val();
            var e_min = $('[name="list[' + id + '][e_min]"]').val();
            var f_id = $('[name="list[' + id + '][f_id]"]').val();
            var extension_time_plan_flg = $('[name="list[' + id + '][extension_time_plan_flg]"]').val();
            var providing_type = $(this).val();

            var form_ary = [];
            form_ary.push(id);
            form_ary.push(s_hour);
            form_ary.push(s_min);
            form_ary.push(e_hour);
            form_ary.push(e_min);
            form_ary.push(use_services);
            form_ary.push(extension_time_plan_flg);
            if (use_services == 1) {
                form_ary.push(providing_type);
            }

            // js_attend_timeでトリガーしているが、そちらでは別で連動処理を通すようにしたので、ここでは通さないようにする
            // js_attend_timeが元で発火していない場合
            if (jsAttendTimeChanged === false) {
                if ($(`#js_related_class${id}`).find('.js_extension').val() === '1' || $(`[name="list[${id}][extension_flg]"]`).val() === '1') {
                // 入退室時間のフォーマット
                let enter_time_hi = s_hour + ':' + (s_min < 10 ? '0' + s_min : s_min);
                let leave_time_hi = e_hour + ':' + (e_min < 10 ? '0' + e_min : e_min);

                // 延長支援時間を取得して、延長支援時間情報とモーダルを出すか出さないかを返す処理
                getDetailExtensionData(childId, f_id, id, select_date, enter_time_hi, leave_time_hi, providing_type, 'allEdit', false,function(response) {
                    if (response.modal_type !== null) {
                        // モーダルを表示
                        showExtensionModal(f_id, response.data, response.form_ary, true, 'all_edit');
                    } else {
                        // モーダル表示しない場合はそのまま一括編集画面用の延長支援加算の連動処理実行
                        setExtensionTimeAllDetail(id, response.data, false);
                    }
                });
                }
            }

            // フラグをリセット
            jsAttendTimeChanged = false;
        }
    }));

    //退室時間、放課後と学休日が押されたら、延長支援加算との連動
    //対象画面：個別編集
    $(document).on("change", ".js_attendance_time, [name=providing_type]", (function () {

        var use_services = $("[name=use_services]").val();
        var s_hour = $('[name="s_hour"]').val();

        //延長支援の連動処理
        if ($('.js_law2024').val()) {

            //必要な情報を取得
            var id = $("[name=r_id]").val();
            var date = $("[name=date]").val();
            var s_min = $('[name="s_min"]').val();
            var e_hour = $('[name="e_hour"]').val();
            var e_min = $('[name="e_min"]').val();
            var f_id = $('[name="f_id"]').val();
            var extension_time_plan_flg = $('[name="extension_time_plan_flg"]').val();
            if (use_services == 1) {
                var providing_type = $('[name="providing_type"]:checked').val();
                if (providing_type == 9) {
                    $('.js_time_division').closest('tr').hide();
                    $('.js_plantime_area').hide();
                } else {
                    $('.js_time_division').closest('tr').show();
                }
            }


            var form_ary = [];
            form_ary.push(id);
            form_ary.push(s_hour);
            form_ary.push(s_min);
            form_ary.push(e_hour);
            form_ary.push(e_min);
            form_ary.push(use_services);
            form_ary.push(extension_time_plan_flg);

            if (use_services == 1) {
                form_ary.push(providing_type);
            }

            //延長の連動はフラグによって行う
            if ($(".js_extension").val() == 1) {
                //もし発火元の要素が加算部分であればここはスキップする
                if ($(this).closest("tr").hasClass('js_adding_tr')) {
                    return;
                }
                setRelatedExtension(date, '', f_id, form_ary);
            }
        }

        //食事提供加算の連動があれば
        if (use_services == 2 && $('.js_meal_add').val()) {
            var meal_add_val = $('.js_meal_add').val();
            //入室時間あり
            if (s_hour) {
                if (meal_add_val == 1) {
                    var eq = 0;
                } else if (meal_add_val == 2) {
                    var eq = 1;
                }
                $('.js_radio_meal').eq(eq).click();
            } else {
                $('.js_radio_meal:last').click();
            }
        }
    }));

    //延長支援加算を算定する・しない
    $(document).on("click", ".js_extension_adding", (function () {

        //フラグ
        var flg = $(this).attr('data-flg');

        //算定する
        if (flg == 1) {

            var form_ary = [];
            var r_id = '';
            var c_id = '';
            var f_id = '';
            var date = '';

            //必要な情報を取得
            //一覧画面
            if ($('.detail_flg').val()) {
                r_id = $("#hidden_r_id").text();
                c_id = $("#hidden_c_id").text();
                f_id = $("#hidden_f_id").text();
                date = $("#hidden_date").text();

                form_ary.push(r_id);
                form_ary.push(0);
                form_ary.push(flg);
            } else if ($('.edit_single_flg').val()) {
                //個別編集
                r_id = $("[name=r_id]").val();
                date = $("[name=date]").val();
                f_id = $('[name="f_id"]').val();

                var use_services = $("[name=use_services]").val();
                var s_hour = $('[name="s_hour"]').val();
                var s_min = $('[name="s_min"]').val();
                var e_hour = $('[name="e_hour"]').val();
                var e_min = $('[name="e_min"]').val();
                var extension_time_plan_flg = $('[name="extension_time_plan_flg"]').val();

                if (use_services == 1) {
                    var providing_type = $('[name="providing_type"]:checked').val();
                }

                var form_ary = [];
                form_ary.push(r_id);
                form_ary.push(s_hour);
                form_ary.push(s_min);
                form_ary.push(e_hour);
                form_ary.push(e_min);
                form_ary.push(use_services);
                form_ary.push(extension_time_plan_flg);

                if (use_services == 1) {
                    form_ary.push(providing_type);
                }
                form_ary.push(flg);
                form_ary.push('dialog');

            } else if ($('.edit_all_flg').val()) {
                //一括編集
                r_id = $("#hidden_r_id").text();
                f_id = $("#hidden_f_id").text();
                date = $("#hidden_date").text();

                var use_services = $('[name="list['+r_id+'][use_services]"]').val();
                var s_hour = $('[name="list['+r_id+'][s_hour]"]').val();
                var s_min = $('[name="list['+r_id+'][s_min]"]').val();
                var e_hour = $('[name="list['+r_id+'][e_hour]"]').val();
                var e_min = $('[name="list['+r_id+'][e_min]"]').val();
                var extension_time_plan_flg = $('[name="list['+r_id+'][extension_time_plan_flg]"]').val();

                if (use_services == 1) {
                    var providing_type = $('[name="list['+r_id+'][providing_type]"]:checked').val();
                }

                var form_ary = [];
                form_ary.push(r_id);
                form_ary.push(s_hour);
                form_ary.push(s_min);
                form_ary.push(e_hour);
                form_ary.push(e_min);
                form_ary.push(use_services);
                form_ary.push(extension_time_plan_flg);
                if (use_services == 1) {
                    form_ary.push(providing_type);
                }
                form_ary.push(flg);
                form_ary.push('dialog');

                //算定するフラグ
                $('[name="list['+r_id+'][extension_calcu_flg]"]').val(1);
            }
            setRelatedExtension(date, c_id, f_id, form_ary);
        } else {
            //算定しない
            if ($('.edit_single_flg').val()) {
                var c_id = $("[name=c_id]").val();
                if ($('[name="adding['+c_id+'][3][selected_content]"]').length) {
                    $('[name="adding['+c_id+'][3][selected_content]"]').closest('td').find('.js_delete_single').click();
                }
            }

            //一括編集
            if ($('.edit_all_flg').val()) {
                r_id = $("#hidden_r_id").text();
                var c_id = $("#js_related_class"+r_id).find('.js_cid').val();
                if ($('[name="adding['+c_id+'][3][selected_content]"]').length) {
                    $('[name="adding['+c_id+'][3][selected_content]"]').closest('tr').find('.js_delete').click();
                }

                $('.js_children_area'+r_id).find('.js_utilization_time').parent().removeClass('extraTime');

                //算定しないフラグ
                $('[name="list['+r_id+'][extension_calcu_flg]"]').val(2);
            }
        }
        $('#extension_dialog').dialog('close');
    }));
});


// 一括編集画面の延長支援加算を選択状態にする処理
function doUpdateExtension(nomodal_data, data) {

    $.each(nomodal_data, function(r_key, r_val) {

        if (data) {

            //初期化
            var adding3_obj = '';
            var blank_obj = '';
            var tbody_obj = $('#js_related_class'+r_val);
            var add_btn_class = '.js_add';
            var del_btn_class = '.js_delete';

            //延長支援加算、空プルダウンのチェック
            $('.js_adding_tr', tbody_obj).each(function () {
                if ($(this).find('.js-selected-adding-all').val() == 3) {
                    //延長支援加算すでに選択されている場合、adding3_objに入れる
                    adding3_obj = $(this);
                }

                if (!$(this).find('.js-selected-adding-all').val()) {
                    //加算の空プルダウンが存在しているなら、blank_objに入れる
                    blank_obj = $(this);
                }
            });

            //延長加算追加
            if (data[r_val]) {

                if (!adding3_obj) {
                    //空プルダウンがあれば、値を設定する
                    if (blank_obj) {
                        blank_obj.find('.js-selected-adding-all').val('3').change();
                        var adding3_obj_new = blank_obj;
                    } else {
                        if ($(add_btn_class + ':last', tbody_obj).length) {
                            $(add_btn_class + ':last', tbody_obj).click();
                            $('.js-selected-adding-all:last', tbody_obj).val('3').change();
                            var adding3_obj_new = $('.js-selected-adding-all:last', tbody_obj);
                        }
                    }

                    if (adding3_obj_new) {
                        for (let index = 0; index < 8; index++) {
                            adding3_obj_new.closest('tr').find('.js_adding_time').eq(index).val(parseInt(data[r_val][index + 1]));
                        }
                    }

                } else {
                    //時間だけ変更する
                    for (let index = 0; index < 8; index++) {
                        adding3_obj.find('.js_adding_time').eq(index).val(parseInt(data[r_val][index + 1]));
                    }
                }
                //算定するフラグ
                $('[name="list['+r_val+'][extension_calcu_flg]"]').val(1);

                //延長加算削除
            } else {
                //延長支援加算が登録されているなら削除する
                if (adding3_obj) {
                    adding3_obj.find(del_btn_class).click();
                }

                //延長支援加算有の緑アイコンを削除する
                $('.js_children_area'+r_val).find('.js_utilization_time').parent().removeClass('extraTime');
                //算定しないフラグ
                $('[name="list['+r_val+'][extension_calcu_flg]"]').val(2);
            }
        }
    })

    return;
}


//基本報酬における算定時間数の設定が変更されたら（個別編集）
$(document).on('change', '[name=use_plantime_flg]', function () {

    var select_date = $("[name=date]").val();

    var s_hour = $("[name=s_hour]").val();
    var s_min = $("[name=s_min]").val();
    var e_hour = $("[name=e_hour]").val();
    var e_min = $("[name=e_min]").val();

    var diff_check_time = checkAttendanceDiffTime(select_date, s_hour, s_min, e_hour, e_min);

    //計画予定時間算定区分
    var plan_time_div = $('.js_plan_time_div').val();

    //実利用時間算定区分
    var attend_time_div = getTimeDivision(diff_check_time);
    if ($("[name=providing_type]").eq(0).is(':checked') && $("[name=s_id]").val() == 1) {
        if (attend_time_div == 3) {
            attend_time_div = 2;
        }
        if (plan_time_div == 3) {
            plan_time_div = 2;
        }
    }

    var time_set_val = '';

    //算定区分数の値の設定
    var use_plantime_flg = $('[name="use_plantime_flg"]:checked').val();

    if (use_plantime_flg == 1) {

        if(diff_check_time < 30){
            //実績時間で算定するかつ、30分未満の場合
            $('input.js_time_division[type="radio"]').prop('checked', false);
        }else{
            //実績時間で算定する場合、実績時間が30分以上の場合
            $('input.js_time_division[type="radio"][value="' + attend_time_div + '"]').prop('checked', true);
        }

        time_set_val = parseInt(diff_check_time);
    //計画時間で算定する場合
    }else if (use_plantime_flg == 2) {
        $('input.js_time_division[type="radio"][value="' + plan_time_div + '"]').prop('checked', true);
        time_set_val = $('.js_plan_time_val').val();
    }

    //算定時間数の値を設定nullだけ通さない(0は通る)
    if ($('.js_time_set').length) {

        //算定時間数の値をリセット
        $('.js_time_set').val('');

        if(time_set_val){
            let time_set = getTimeSet(time_set_val);
            $('.js_time_set').val(time_set);

        }
    }
});


//基本報酬における算定時間数の設定が変更されたら（一括編集）
$(document).on('change', '.js_use_plantime_flg', function () {

    $(this).closest('tr').find('.js_attend_time:first').trigger('change');
    var use_plantime_flg = $(this).val();

    // データ属性を更新
    $(this).attr('data-selected', use_plantime_flg);
    //一括編集の個別で算定プルダウンが変更になった場合のデータ属性を更新
    $(this).attr('data-changed', use_plantime_flg);


    let rid = $(this).closest('tr').data('rid');
    let use_services = parseInt($(`[name="list[${rid}][use_services]"]`).val());
    let providing_type = parseInt($(`#providing${rid}`).find('.providingChecked').val());

    // 算定区分と算定時間数をセットする
    setTimeDivisionTimeSetAllEdit(rid, use_services, providing_type);

});


//一括編集画面の提供形態が変更されたら算定区分のセレクトボックスを変更する
$(document).on('change', '.js_bulk_edit_providing', function () {

    let rid = $(this).closest('tr').data('rid');
    let providing_type = parseInt($(this).val());
    let use_services = parseInt($(`[name="list[${rid}][use_services]"]`).val());

    // 提供形態が放課後の場合は選択肢から区分３を削除
    if (providing_type === PROVIDING_AFTER_SCHOOL && use_services === AFTER_SCHOOL_DAY_CARE) {
        $('[name="list[' + rid + '][time_division]"]').find('option[value="3"]').remove();

    } else {
        if (!$('[name="list[' + rid + '][time_division]"]').find('option[value="3"]').length) {
            $('[name="list[' + rid + '][time_division]"]').append($('<option>', {
                value: 3,
                text: '区分３'
            }));
        }
    }

    // 算定区分と算定時間数をセットする
    setTimeDivisionTimeSetAllEdit(rid, use_services, providing_type);

});

// 一括編集画面の提供形態が変更されたら算定時間数を変更する
$(document).on("change", "[name*='providing_type']", (function () {

    let rid = $(this).closest('tr').data('rid');
    let use_services = parseInt($(`[name="list[${rid}][use_services]"]`).val());
    let providing_type = parseInt($(this).val());

    // 算定区分と算定時間数をセットする
    setTimeDivisionTimeSetAllEdit(rid, use_services, providing_type);
}));

$(document).on('click', '.js_r_id, .js_checkAll', function() {
    // .js_r_idクラスチェックボックスが一つでもチェックされていれば真
    const anyChecked = $('.js_r_id:checked').length > 0;

    // 延長支援加算を算定するボタンの要素を取得
    const buttonElement = $(this)
        .closest('div').parent()   // 親divの親div
        .next('div')               // 次のdiv要素
        .find('.ui-dialog-buttonset button:first');  // ui-dialog-buttonsetクラス内の最初のボタン

    if (anyChecked) {
        // 1つでもチェックがあればボタンを活性化
        buttonElement.removeClass('ui-state-disabled').prop('disabled', false);
    } else {
        // 全てのチェックが外れている場合のみボタンを非活性化
        buttonElement.addClass('ui-state-disabled').prop('disabled', true);
    }
});

// 算定区分判定
function getTimeDivision(time) {

    var time_division = '';
    //時間区分の判定
    //30分未満の場合はnull、区分１は30~90分、区分２は91~180分、区分３は181分以上
    if (time >= 0 && time < 30) {
        time_division = null;
    } else if (time >= 30 && time <= 90) {
        time_division = 1;
    } else if (time > 90 && time <= 180) {
        time_division = 2;
    } else if (time > 180) {
        time_division = 3;
    }

    return time_division;
}


/**
 * 算定区分のラジオボタンの有効/無効を切り替える関数（個別編集）
 *
 * @param {number} providing_type - 提供形態
 *
 * @return void
 */
function toggleTimeDivisionRadioButton(providing_type) {
    let disable = false;
    let time_division = $(`[name="time_division"]:checked`).val();
    let time_set = $(`[name="time_set"]`).val();
    let minutes_time_set = '';
    let attend_time_div = '';

    if (providing_type === PROVIDING_AFTER_SCHOOL) {
        disable = true;
    }

    $('input.js_time_division').each(function() {
        let time_division_always_enable_radio_button = $(this).attr('data-time_division_always_enable_radio_button');

        // 常に有効なラジオボタン以外の場合は有効/無効を切り替える
        if (!time_division_always_enable_radio_button) {
            $(this).prop('disabled', disable);

            // ラジオボタンが選択不可の場合はグレーアウト、選択可能の場合はグレーアウトを解除
            let label = $(this).closest('label');
            if (disable) {
                label.addClass('lightgray');
            } else {
                label.removeClass('lightgray');
            }
        }
    });

    // 提供形態と算定時間数が設定されているのに算定区分が未設定の場合
    if (providing_type && time_set && !time_division) {
        minutes_time_set = time_set * 60;   // 分に直す

        // 算定区分をセットする
        attend_time_div = getTimeDivision(minutes_time_set);

        if (providing_type === PROVIDING_AFTER_SCHOOL && attend_time_div === 3) {
            attend_time_div = 2;
        }
        $(`input[type="radio"][name="time_division"][value="`+attend_time_div+`"]`).prop('checked', true);
    }
}

/**
 * 提供形態に基づいて計画の算定区分、算定時間数を設定する関数（個別編集）
 *
 * @param {number} providing_type - 提供形態
 *
 * @return void
 */
function setPlanTime(providing_type) {

    selector_plan_div = '.js_plan_time' + providing_type + '_div';
    selector_plan_name = '.js_plan_time' + providing_type + '_name';
    selector_plan_value = '.js_plan_time' + providing_type;

    if ($(selector_plan_div).length) {
        $('.js_plan_time_div').val($(selector_plan_div).val());
        $('.js_plan_time').html($(selector_plan_name).val());
        $('.js_plan_time_div_display').html($(selector_plan_div).val());
        $('.js_plan_time_val').val($(selector_plan_value).val());

    } else {
        $('.js_plan_time_div').val('');
        $('.js_plan_time').html('');
        $('.js_plan_time_div_display').html('');
        $('.js_plan_time_val').val('');
    }
}

/**
 * 算定区分、算定時間数を設定する関数（一括編集） 一括反映||一括編集画面内の個別編集も通ってる
 *
 * @param {number} rid - 予約ID
 * @param {number} use_services - 利用サービス
 * @param {number} providing_type - 提供形態
 *
 * @return void
 */
function setTimeDivisionTimeSetAllEdit(rid, use_services, providing_type = null) {

    let s_hour = parseInt($(`[name="list[${rid}][s_hour]"]`).val(), 10);
    let s_min = parseInt($(`[name="list[${rid}][s_min]"]`).val(), 10);
    let e_hour = parseInt($(`[name="list[${rid}][e_hour]"]`).val(), 10);
    let e_min = parseInt($(`[name="list[${rid}][e_min]"]`).val(), 10);

    // 開始時間と終了時間を分単位で計算
    let start_time = s_hour * 60 + s_min;
    let end_time = e_hour * 60 + e_min;
    let attend_time = end_time - start_time;

    // 入退室時間がnullの場合は何もしない
    if (attend_time === null) {
        return;
    }

    let children_area = $(`.js_children_area${rid}`);
    //class="js_attend_div"のjs_plantime_areaを使用する
    let plantime_area = children_area.find('.js_plantime_area:last');

    // 実績の算定区分、算定時間数を取得
    let attend_time_div = getTimeDivision(attend_time);
    let attend_time_set = getTimeSet(attend_time);

    // 計画時間の算定区分、計画時間を取得
    let { plantime_div, plantime_minute, plantime_name } = getPlanTimeDataAllEdit(use_services, rid, providing_type);
    let plantime_set = getTimeSet(plantime_minute);

    // 計画フラグを取得
    let use_plantime_flg = parseInt(children_area.find('.js_use_plantime_flg').eq(1).attr('data-selected'));

    if (!use_plantime_flg) {
        use_plantime_flg = parseInt(children_area.find('.js_use_plantime_flg option:selected').val());
    }

    // 放デイで放課後の場合に区分３の場合は区分２に変更
    let updated_time_divisions = adjustTimeDivisionsForAfterSchoolDayCare(use_services, providing_type, attend_time_div, plantime_div);
    attend_time_div = updated_time_divisions.attend_time_div;
    plantime_div = updated_time_divisions.plantime_div;

    //実績時間が30分未満あれば、算定区分を空にする
    if (attend_time < 30) {
        //算定区分なし
        $(`.js_${rid}_time_division`).val('');
        $(`.js_${rid}_time_set`).val('');
    }

    if (typeof attend_time === 'number' && !isNaN(attend_time)) {

        // 実績区分と計画区分が異なる場合 || 計画があり && 30分未満の場合
        if (attend_time_div && plantime_div && attend_time_div !== plantime_div || plantime_div && attend_time !== null && attend_time < 30) {

            if (
                //児童の利用サービスが放デイ && 提供形態が 放課後 または 学休日 の場合
                (use_services === AFTER_SCHOOL_DAY_CARE && (providing_type === PROVIDING_AFTER_SCHOOL || providing_type === PROVIDING_SCHOOL_HOLIDAYS))

                //または　児童の利用サービスが児童発達支援 && 基本報酬算定するボタンを押している場合 || または　児童発達支援 && 利用時間が30分以上の場合
                ||(use_services === CHILD_DEVELOPMENT_SUPPORT && providing_type === 5)||(use_services === CHILD_DEVELOPMENT_SUPPORT && attend_time >= 30)
            ) {

                //算定プルダウンを表示
                plantime_area.show();

                plantime_area.find('.js_use_plantime_flg').val();
                // プルダウンが変更されている場合場合
                let change_plan = plantime_area.find('.js_use_plantime_flg').attr('data-changed');

                // 30分未満の場合の計画で算定するをデフォルトで設定する※実績で算定されている場合は通らない
                if (attend_time < 30 && !change_plan) {

                    use_plantime_flg = USE_PLAN_TIME;
                    $(`.js_${rid}_time_division`).val(plantime_div);
                    if (plantime_set) {
                        $(`.js_${rid}_time_set`).val(plantime_set);
                    }

                    // 30分未満の場合の計画で算定するをデフォルトで設定
                    plantime_area.find('.js_use_plantime_flg').val(USE_PLAN_TIME);
                }
            }

            //児童の利用サービスが児童発達支援 && 基本報酬算定しないボタンを押している場合
            if (use_services === CHILD_DEVELOPMENT_SUPPORT && providing_type === 9) {
                //算定プルダウンを非表示
                plantime_area.hide();
            }

            //提供形態を表示
            if (plantime_area.is(':visible')) {

                //計画時間数
                plantime_area.find('.js_plan_time').text(plantime_name);

                // 実績算定の場合
                if (use_plantime_flg === USE_ATTEND_TIME) {

                    //30分未満の場合
                    if (attend_time < 30) {
                        $(`.js_${rid}_time_division`).val('');
                        $(`.js_${rid}_time_set`).val('');
                    } else {
                        $(`.js_${rid}_time_division`).val(attend_time_div);
                        $(`.js_${rid}_time_set`).val(attend_time_set);
                    }
                // 計画算定の場合
                } else if (use_plantime_flg === USE_PLAN_TIME) {

                    //算定区分
                    $(`.js_${rid}_time_division`).val(plantime_div);

                    //算定時間数があれば(30分未満は空)
                    if(plantime_set){
                        $(`.js_${rid}_time_set`).val(plantime_set);
                    }
                }
            }

        // 実績区分と計画区分が同じ場合
        } else if (attend_time_div && plantime_div && attend_time_div === plantime_div) {

            //計画区分と計画時間を表示
            $(`.js_${rid}_time_division`).val(plantime_div);
            $(`.js_${rid}_time_set`).val(plantime_set);
            plantime_area.hide();

        // 実績区分または計画区分が未設定の場合,欠席の場合
        } else {

            //計画区分と計画時間を表示
            $(`.js_${rid}_time_division`).val(attend_time_div);
            $(`.js_${rid}_time_set`).val(attend_time_set);
            plantime_area.hide();
        }
    }
}

/**
 * 利用サービス、予約ID、提供形態に基づいて別表計画データを取得する関数（一括編集）
 *
 * @param {string} use_services - 利用サービス
 * @param {string} rid - 予約ID
 * @param {string} providing_type - 提供形態
 *
 * @returns {Object} 計画区分、計画時間（分単位）、計画時間（何時間何分）を含むオブジェクト
 */
function getPlanTimeDataAllEdit(use_services, rid, providing_type) {
    if (use_services === AFTER_SCHOOL_DAY_CARE) {
        return {
            plantime_div: parseInt($(`.js_${rid}_plan_time${providing_type}_div`).val()),
            plantime_minute: parseInt($(`.js_${rid}_plan_time${providing_type}`).val()),
            plantime_name: $(`.js_${rid}_plan_time${providing_type}_name`).val(),
        };
    } else if (use_services === CHILD_DEVELOPMENT_SUPPORT) {
        return {
            plantime_div: parseInt($(`.js_${rid}_plan_time_div`).val()),
            plantime_minute: parseInt($(`.js_${rid}_plan_time`).val()),
            plantime_name: $(`.js_${rid}_plan_time_name`).val(),
        };
    }
    return { plantime_div: null, plantime_minute: null, plantime_name: '' };
}

/** 算定時間数の計算
 * @param {number} time - 時間(分)
 *
 * @returns {number|null} - 算定時間数
 */
function getTimeSet(time) {
    let calculation_flg = 1;
    let home_num = time / 60;
    let syou = Math.floor(time / 60);
    let calculation_result = null;
    let calculation_time = null;
    let time_int  = parseInt(time);

    //体制等状況管理の設定から、小数点第何位まで計算するかを取得
    const decimal_point_setting = $('.js_time_set').data('hours-decimal-point');

    // 設定値が1の場合、小数点第2位まで計算
    if (decimal_point_setting === 1) {
        if (time_int < 30) {
            return null; // 30分未満はnullを返す
        } else {
            // それ以上の時間は全て計算する
            calculation_time = Math.round((time / 60) * 100) / 100;
        }
    } else {
        // 小数点第1位まで計算(従来の計算方法)
        //30分未満の場合
        if (time_int < 30) {
            return null; // nullを返すために30未満を設定
        } else if (time_int === 30) {
            calculation_result = 50; // 0.5を返すために50を設定
        } else if (time_int <= 59) {
            calculation_result = 100; // 1を返すために100を設定
        } else {
            // 60分以上の場合
            calculation_result = calculateBillingTime(time_int);
        }

        // 算定時間数フラグがある場合は、開始・終了時間の算定時間計算用の情報を返す
        calculation_time = calculation_flg ? (calculation_result / 100) : ('0000' + calculation_result).slice(-4);
    }

    return calculation_time;
}

/** 与えられた時間から算定時間数を計算する関数
 * @param {number} different_time - 入室時間と退室時間の差
 * @returns {number|null} - 算定時間数
 */
function calculateBillingTime(different_time) {
    // 繰り上げる時間（分）の基準値
    const first_point = 0;
    const middle_point = 30;
    // 追加する時間（分）
    const half_add = 50;
    const one_add = 100;

    // 差分を時間と分に変換
    const exit_hour = Math.floor(different_time / 60); // 時間部分
    const remaining_minutes = different_time % 60;

    // 算定時間数を計算
    let calculation_result = 100 * exit_hour;
    if (remaining_minutes > first_point && remaining_minutes <= middle_point) {
        // 強制的に30分表記にするために追加
        calculation_result += half_add;
    } else if (remaining_minutes > middle_point) {
        // 時間を繰り上げる
        calculation_result += one_add;
    }

    return calculation_result;
}


/**
 * 放デイで放課後の場合に算定区分を３から２にする関数）
 *
 * @param {number} use_services - 利用サービス
 * @param {number} providing_type - 提供形態
 * @param {number} attend_time_div - 実績区分
 * @param {number|null} plantime_div - 計画区分
 *
 * @returns {Object} -　算定区分を調整したオブジェクト
 */
function adjustTimeDivisionsForAfterSchoolDayCare(use_services, providing_type, attend_time_div, plantime_div = null) {
    if (use_services === AFTER_SCHOOL_DAY_CARE && providing_type === PROVIDING_AFTER_SCHOOL) {
        if (attend_time_div === 3) {
            attend_time_div = 2;
        }
        if (plantime_div === 3) {
            plantime_div = 2;
        }
    }

    return { attend_time_div, plantime_div };
}


//加算実績はtbody毎にソートする
$(function () {
    $('.sortTableAdding').tablesorter({
        widgets: ['sortTbody', 'filter'],
    });
});


//加算実績のサービスでソート後、色付け用クラス付与
$(document).on('click', '.js_sort_service_adding', function () {
    applyColorClasses();
});

// 延長支援加算モーダル用の処理
$(function () {

    // 延長支援加算モーダルのラジオボタン変更時の処理
    $(document).on('click', '[name="check_extension_addition"]', function () {
        // 押下された要素の値を取得
        let value = $(this).val();

        // 親tbody内の3つ目のtr要素のtd要素を選択
        let target_td = $(this).closest('tbody').find('tr').eq(2).find('td');

        // 値が1の場合は表示、2の場合は非表示にする
        if (value == '1') {
            target_td.removeClass('paymentDisabled');
        } else if (value == '0') {
            target_td.addClass('paymentDisabled');
        }

        // 警告文と保存ボタンの状態を更新
        checkExtensionSupportTimeModal();
    });

    // 延長支援加算モーダルの時間プルダウン変更時の処理
    $(document).on('change', '.js_extension_time, .js_extension_time2', function () {
        if ($(this).hasClass('js_extension_hour')) {
            let hour = $(this).val();
            let min_element = $(this).next('.js_extension_min'); // 隣のminuteクラス要素を取得
            let min = min_element.val();

            // 時間の値に応じて分の値を設定
            if (hour && min == 0) {
                min_element.val(0); // 分を0に設定
            } else if (!hour) {
                min_element.val(''); // 時間が未選択なら分も未選択に
            }
        }

        // 警告文と保存ボタンの状態を更新
        checkExtensionSupportTimeModal();

    });

    // 延長支援加算警告モーダルの保存するボタン押下時の処理
    $(document).on('click', '.js-modalExtensionSave', function () {
        // モーダルから情報を渡すフラグ
        let after_modal_flg = 1;

        // 親ウィンドウのDOMへ保存したdataを取得
        let data = $('.attendanceDetail .ibox #modal_extension_support', window.parent.document).data();

        // クリックされたボタンから予約ID、児童ID、利用サービスを取得
        let r_id = $(this).attr('data-r_id');
        let child_id = $(this).attr('data-c_id');
        let use_services = $(this).attr('data-use_services');

        // 提供形態から表示したモーダルかどうか把握用
        let providing_flg = parseInt($(this).attr('data-providing_flg'));

        // 日付、施設ID、表示元の画面情報（一覧か一括編集）取得
        let date = $('[name="extension_date"]').val();
        let facility_id = $('[name="f_id"]').val();
        let modal_mode = $('[name="modal_display_mode"]').val();

        // 延長支援加算を算定するしないラジオボタンの値を取得
        let save_extension = $('[name="check_extension_addition"]:checked').val();

        // 延長支援加算を算定する場合
        if (save_extension == 1) {
            // 選択した延長支援時間を配列へ格納
            let ex_time_data = [];
            ex_time_data[1] = $(`select[name="adding[${child_id}][times1][hour1]"]`).val() || '';;
            ex_time_data[2] = $(`select[name="adding[${child_id}][times1][min1]"]`).val() || '';;
            ex_time_data[3] = $(`select[name="adding[${child_id}][times1][hour2]"]`).val() || '';;
            ex_time_data[4] = $(`select[name="adding[${child_id}][times1][min2]"]`).val() || '';;
            ex_time_data[5] = $(`select[name="adding[${child_id}][times2][hour1]"]`).val() || '';;
            ex_time_data[6] = $(`select[name="adding[${child_id}][times2][min1]"]`).val() || '';;
            ex_time_data[7] = $(`select[name="adding[${child_id}][times2][hour2]"]`).val() || '';;
            ex_time_data[8] = $(`select[name="adding[${child_id}][times2][min2]"]`).val() || '';;

            // 一覧画面の場合の処理
            if (modal_mode == 'detail') {
                // 提供形態から表示したモーダルの場合
                if (providing_flg == 1) {
                    // 保存ボタン押下後すぐに登録処理実行

                    // 必要な情報を配列へ格納
                    let form_ary = [];
                    form_ary.push(r_id);
                    form_ary.push(use_services);
                    form_ary.push(ex_time_data[1], ex_time_data[2], ex_time_data[3], ex_time_data[4]);
                    form_ary.push(ex_time_data[5], ex_time_data[6], ex_time_data[7], ex_time_data[8]);

                    // 延長支援加算を連動（親ウィンドウで実行）
                    window.parent.setRelatedExtensionDetail(date, child_id, facility_id, form_ary);

                } else {
                    // 退室時間から表示したモーダルの場合
                    // 一覧画面での延長支援時間の登録処理の準備 すぐには保存しない為、DOM要素へ一時的に保存する
                    // 親ウィンドウへ選択情報を一時保存する要素を取得
                    let $parentTarget = $(`.attendanceList.attendanceListTable:eq(0) .pickTableWrap #extension_support_save_${r_id}`, window.parent.document);
                    if ($parentTarget.length > 0) {
                        // データを設定する
                        $parentTarget.attr({'data-r_id': r_id,});

                        // 延長支援加算の時間をセット（時間1の開始時間と終了時間、時間2の開始時間と終了時間）
                        for (let i = 1; i <= 8; i++) {
                            $parentTarget.attr(`data-extime${i}`, ex_time_data[i]);
                        }
                    }
                }

            } else if (modal_mode == 'all_edit') {
                // 一括編集画面の場合（全体反映ではなく個別）の処理
                setExtensionTimeAllDetail(r_id, ex_time_data, true);
            }

        } else {
            // 延長支援加算を算定しない場合

            // 一覧画面の場合の処理
            if (modal_mode == 'detail') {
                // 提供形態から表示したモーダルの場合
                if (providing_flg == 1) {

                    // 必要な情報を配列へ格納
                    let form_ary = [];
                    form_ary.push(r_id);
                    form_ary.push(use_services);
                    // 延長支援時間を空文字を格納（連動処理で空文字かどうかで処理を分岐している為）
                    form_ary.push('', '', '', '');
                    form_ary.push('', '', '', '');

                    // 延長支援加算を連動（親ウィンドウで実行）
                    window.parent.setRelatedExtensionDetail(date, child_id, facility_id, form_ary);

                } else {
                    // 退室時間から表示したモーダルの場合
                    // 一覧画面での延長支援時間の登録処理の準備 すぐには保存しない為、DOM要素へ一時的に保存する
                    // 親ウィンドウへ選択情報を一時保存する要素を取得
                    let $parentTarget = $(`.attendanceList.attendanceListTable:eq(0) .pickTableWrap #extension_support_save_${r_id}`, window.parent.document);
                    if ($parentTarget.length > 0) {
                        // データを設定する
                        $parentTarget.attr({
                            'data-r_id': r_id,
                        });
                    }
                }

            } else if (modal_mode == 'all_edit') {
                // 一括編集画面の場合（全体反映ではなく個別）の処理
                setExtensionTimeAllDetail(r_id, null, true);
            }
        }

        // 一覧画面且つ、退室時間から表示したモーダルの場合のみ実行
        if (modal_mode == 'detail' && providing_flg !== 1) {
            // 引数の準備
            let plantime_div = data.plantime_div ? data.plantime_div : null;
            let use_plantime_flg = data.use_plantime_flg ? data.use_plantime_flg : null;
            let time_division = data.time_division ? data.time_division : null;
            let time_set = data.time_set ? data.time_set : null;
            let reason_staff = data.reason_staff ? data.reason_staff : null;
            let reason = data.reason ? data.reason : null;

            // 親ウィンドウで setAttendanceSaveData を実行
            window.parent.setAttendanceSaveData(
                data.r_id,
                data.c_id,
                data.f_id,
                data.is_mail,
                data.attend_flg,
                data.providing_type,
                data.linkage,
                data.select_date,
                data.enter_time_hi,
                data.leave_time_hi,
                data.diff_check_time,
                data.interval_time,
                data.change_attendance_flg,
                plantime_div,
                use_plantime_flg,
                time_division,
                time_set,
                reason_staff,
                reason,
                data.after_providing_flg,
                after_modal_flg,
            );
        }

        // モーダルを閉じる処理
        $('.mfp-bg', window.parent.document).trigger('click');
    });

    // 延長支援加算警告モーダルのキャンセルボタン押下時の処理
    $(document).on('click', '.js-modalExtensionCansel', function () {
        // モーダルから情報を渡すフラグ
        let after_modal_flg = 1;

        // 親ウィンドウのDOMへ保存したdataを取得
        let data = $('.attendanceDetail .ibox #modal_extension_support', window.parent.document).data();

        let modal_mode = $('[name="modal_display_mode"]').val();

        // 提供形態から表示したモーダルかどうか把握用
        let providing_flg = parseInt($(this).attr('data-providing_flg'));

        // 一覧画面且つ、退室時間から表示したモーダルの場合のみ実行
        if (modal_mode == 'detail' && providing_flg !== 1) {
            // 引数の準備
            let plantime_div = data.plantime_div ? data.plantime_div : null;
            let use_plantime_flg = data.use_plantime_flg ? data.use_plantime_flg : null;
            let time_division = data.time_division ? data.time_division : null;
            let time_set = data.time_set ? data.time_set : null;
            let reason_staff = data.reason_staff ? data.reason_staff : null;
            let reason = data.reason ? data.reason : null;

            // 親ウィンドウで setAttendanceSaveData を実行
            window.parent.setAttendanceSaveData(
                data.r_id,
                data.c_id,
                data.f_id,
                data.is_mail,
                data.attend_flg,
                data.providing_type,
                data.linkage,
                data.select_date,
                data.enter_time_hi,
                data.leave_time_hi,
                data.diff_check_time,
                data.interval_time,
                data.change_attendance_flg,
                plantime_div,
                use_plantime_flg,
                time_division,
                time_set,
                reason_staff,
                reason,
                data.after_providing_flg,
                after_modal_flg,
            );
        }

        // モーダルを閉じる処理
        $('.mfp-bg', window.parent.document).trigger('click');
    });


});

/**
 * 延長支援加算における2つの時刻ペアの差分をチェックし、
 * 各時刻の差分を時間と分の形式で返す。
 * 1時間未満なら〇分、1時間以上なら〇時間〇分で表現します。
 *
 * @param {Object} start1 最初の時刻ペアの開始時刻オブジェクト（{ hour: number, min: number }）
 * @param {Object} end1 最初の時刻ペアの終了時刻オブジェクト（{ hour: number, min: number }）
 * @param {Object} start2 2つ目の時刻ペアの開始時刻オブジェクト（{ hour: number, min: number }）
 * @param {Object} end2 2つ目の時刻ペアの終了時刻オブジェクト（{ hour: number, min: number }）
 * @return {Object} 2つの時刻ペアの差分（分単位）。{ diff_time1: string, diff_time2: string }
 */
function getExtensionSupportDiffTime(start1, end1, start2, end2) {
    let diff_time1 = "";
    let diff_time2 = "";

    // 最初の時刻ペアの差分計算
    if ($.isNumeric(start1.hour) && $.isNumeric(start1.min) && $.isNumeric(end1.hour) && $.isNumeric(end1.min)) {
        const check_date1_start = (start1.hour * 60) + start1.min;  // 開始時刻1を分に変換
        const check_date1_end = (end1.hour * 60) + end1.min;        // 終了時刻1を分に変換
        if (check_date1_end > check_date1_start) {
            const diff = check_date1_end - check_date1_start;          // 差分を計算
            diff_time1 = getFormatDiffTime(diff);                      // フォーマットして格納
        }
    }

    // 2つ目の時刻ペアの差分計算
    if ($.isNumeric(start2.hour) && $.isNumeric(start2.min) && $.isNumeric(end2.hour) && $.isNumeric(end2.min)) {
        const check_date2_start = (start2.hour * 60) + start2.min;  // 開始時刻2を分に変換
        const check_date2_end = (end2.hour * 60) + end2.min;        // 終了時刻2を分に変換
        if (check_date2_end > check_date2_start) {
            const diff = check_date2_end - check_date2_start;          // 差分を計算
            diff_time2 = getFormatDiffTime(diff);                      // フォーマットして格納
        }
    }

    // 差分を返す
    return { diff_time1, diff_time2 };
}

/**
 * 数字を時間表記へ変換する関数
 * 1時間未満なら「〇分」、1時間以上なら「〇時間〇分」で返す
 *
 * @param {number} diff 時間（分単位）
 * @return {string} フォーマットされた時間差
 */
function getFormatDiffTime(diff) {
    if (diff >= 60) {
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`;
    } else {
        return `${diff}分`;
    }
}


/**
 * 延長支援加算の警告文の表示、書き換え操作（個別編集）
 * 警告文表示しないが延長支援加算連動する場合もここで実行
 *
 * @param {Object} data   - 延長支援加算に関連するデータ（ajaxで取得された情報）
 */
function handleExtensionSupportDisplay(data) {
    // 延長支援加算の警告文のクラスを格納
    const extension_support_element = $('.js-extension-support');

    // 延長支援時間の取得フラグ
    let is_extension_support_time_flg = false;

    // 延長支援加算を連動しないフラグ（警告文を非表示、延長支援加算を削除する）
    let is_extension_support_unlinked = false;

    // 選択している提供形態を取得
    let providing_type = parseInt($("input[name='providing_type']:checked").val());

    if (data) {
        // 要素から延長支援加算関連の情報を取得し格納
        // 別表に延長支援時間の登録がない時の延長支援加算の連動設定
        const extension_no_plan_time = $('.js_extension_support_no_plan_time').val();
        // 延長支援が30分以上～1時間未満時の延長支援加算の連動設定
        const extension_30min_1hour = $('.js_extension_30min_1hour').val();
        // 別表に延長支援加算時間が登録されている場合フラグ格納処理
        let extension_time_plan_flg = (parseInt($('[name="extension_time_plan_flg"]').val()) === 1) ? 1 : 0;

        // 平日学休日の場合且つ、平日学休日の延長支援時間の設定がある場合はフラグを書き換える
        const extension_time_plan_holiday_flg = (parseInt($('[name="extension_time_plan_holiday_flg"]').val()) === 1) ? 1 : 0;
        if (providing_type === PROVIDING_SCHOOL_HOLIDAYS && IS_HOLIDAY === false) {
            extension_time_plan_flg = extension_time_plan_holiday_flg;
        }

        // 引数から延長支援加算の時間情報を取得し整える
        // 延長支援加算の時間を格納
        const start1_time = { hour: parseInt(data[1]), min: parseInt(data[2]) };
        const end1_time = { hour: parseInt(data[3]), min: parseInt(data[4]) };
        const start2_time = { hour: parseInt(data[5]), min: parseInt(data[6]) };
        const end2_time = { hour: parseInt(data[7]), min: parseInt(data[8]) };
        // 時間情報を使って延長支援加算の時間の差を取得
        const result = getExtensionSupportDiffTime(start1_time, end1_time, start2_time, end2_time);

        // ここから警告文のタイトルと赤文字生成処理
        // 警告文のタイトルを定義
        let exclamation_title = '';
        // 警告文の赤字文を定義
        let exclamation_red_massage = '';

        // 別表の延長支援時間が未設定の場合
        if (!extension_time_plan_flg) {
            // 体制等の設定「別表に延長支援時間の登録がない時～」が「加算連動しない」
            if (parseInt(extension_no_plan_time) === 3) {
                is_extension_support_unlinked = true;
            } else if (parseInt(extension_no_plan_time) === 2) {
                // 警告文のタイトルを設定
                exclamation_title = 'one';
            }
        }

        // 延長支援時間が30分以上1時間未満の場合
        if (data[10]) {
            // 体制等の設定「延長支援が30分以上～1時間未満時～」が「加算連動しない」
            if (parseInt(extension_30min_1hour) === 2) {
                is_extension_support_unlinked = true;
            } else if (parseInt(extension_30min_1hour) === 1) {
                // 警告文の赤字文を設定（警告文のタイトルで設定内容を分岐）
                exclamation_red_massage = exclamation_title ? 'one' : 'two';

                // 警告文のタイトルを設定
                exclamation_title = exclamation_title ? 'one' : 'two';
            }
        }

        // 警告文のタイトルが設定されている場合
        // すべての警告文とエラーメッセージを非表示にする
        extension_support_element.find('.js-extension-support-title-one').hide();
        extension_support_element.find('.js-extension-support-title-two').hide();
        extension_support_element.find('.js-extension-support-err-one').hide();
        extension_support_element.find('.js-extension-support-err-two').hide();

        // タイトルの表示設定
        if (exclamation_title === 'one') {
            extension_support_element.find('.js-extension-support-title-one').show();
        } else if (exclamation_title === 'two') {
            extension_support_element.find('.js-extension-support-title-two').show();
            // 「延長支援加算を算定する」をクリックしたフラグをリセット
            $('[name=extension_support_err_two_click_flag]').val(0);
        }
        // エラーメッセージの表示設定
        if (exclamation_red_massage === 'one') {
            extension_support_element.find('.js-extension-support-err-one').show();
        } else if (exclamation_red_massage === 'two') {
            extension_support_element.find('.js-extension-support-err-two').show();
        }
        // 警告文のタイトルと赤文字設定処理ここまで

        // 延長支援時間1の処理
        const time1_container = $('.js-extension-support-time-one');
        // 延長支援加算時間1がある場合
        if (result.diff_time1) {
            // 延長支援時間1を警告文へ挿入、表示、取得フラグ格納
            time1_container.find('.fz20').html(`${data["1"]}:${data["2"]}～${data["3"]}:${data["4"]}<small>（${result.diff_time1}）</small>`);
            time1_container.show();
            is_extension_support_time_flg = true;
        } else {
            time1_container.hide();
        }

        // 延長支援時間2の処理
        const time2_container = $('.js-extension-support-time-two');
        // 延長支援加算時間2がある場合
        if (result.diff_time2) {
            // 延長支援時間2を警告文へ挿入、表示、取得フラグ格納
            time2_container.find('.fz20').html(`${data["5"]}:${data["6"]}～${data["7"]}:${data["8"]}<small>（${result.diff_time2}）</small>`);
            time2_container.show();
            is_extension_support_time_flg = true;
        } else {
            time2_container.hide();
        }

        // 延長支援時間が取得できている場合
        if (is_extension_support_time_flg) {
            // 延長支援加算を算定するボタンのdataを書き換える
            extension_support_element.find('.btn').attr('data-extension-data', JSON.stringify(data));

            // 延長支援加算警告文のタイトルが設定されている場合
            if (exclamation_title) {
                // 警告文を表示
                extension_support_element.show();

                // 延長支援加算の選択済みプルダウンを削除する処理
                // 初期化
                let adding3_obj = '';
                let tbody_obj = $('form');
                let del_btn_class = '.js_delete_single';

                // 延長支援加算、空プルダウンのチェック
                $('.js_adding_tr', tbody_obj).each(function () {
                    if ($(this).find('.js-selected-adding-all').val() == 3) {
                        // 延長支援加算すでに選択されている場合、adding3_objに入れる
                        adding3_obj = $(this);
                    }
                });

                // 延長支援加算の選択済みプルダウンがあれば削除
                if (adding3_obj) {
                    adding3_obj.find(del_btn_class).click();
                }

            } else {
                // 警告文出さないが連動する場合は、延長支援加算の連動を強制実行
                extension_support_element.find('.btn').trigger('click');
            }

        } else {
            is_extension_support_unlinked = true;
        }

    } else {
        is_extension_support_unlinked = true;
    }

    // フラグがある場合
    if (is_extension_support_unlinked) {
        // 警告文を非表示
        extension_support_element.hide();
        // 延長支援加算の削除処理を強制実行
        addingExtensionSupport(null);
    }
}


/**
 * 延長支援加算を算定するボタン押下時の処理（個別編集）
 * 要素内のdataを使って、延長支援加算を入力状態にする
 *
 * * @param {HTMLElement} button - 押されたボタン要素
 */
function addingExtensionSupport(button = null) {
    // dataを定義
    let data = null;

    // 加算項目の表示権限を取得
    const adding_view_flg = $('.js_no_view_adding').val() ? true : false;

    // 延長支援加算を算定するボタン押下時の処理
    if (button) {
        // ボタン内のdata属性の値（延長支援加算の時間）を取得
        let extension_data = $(button).attr('data-extension-data');

        // 無効なJSON文字列が渡された場合、dataへnullを格納（クラッシュ予防）
        try {
            if (extension_data) {
                // JSON文字列をオブジェクトへ変換
                data = JSON.parse(extension_data);
            }
        } catch (e) {
            console.error("Invalid JSON format:", e);
            data = null;
        }
    }

    // 個別編集画面のフラグ
    let single_flg = $('.edit_single_flg').val();

    // 初期化
    let adding3_obj = '';
    let blank_obj = '';

    // 個別編集
    let tbody_obj = single_flg ? $('form') : $('#js_related_class' + r_id);
    let add_btn_class = single_flg ? '.js_add_single' : '.js_add';
    let del_btn_class = single_flg ? '.js_delete_single' : '.js_delete';

    // 延長支援加算、空プルダウンのチェック
    $('.js_adding_tr', tbody_obj).each(function () {
        if ($(this).find('.js-selected-adding-all').val() == 3) {
            // 延長支援加算すでに選択されている場合、adding3_objに入れる
            adding3_obj = $(this);
        }

        if (!$(this).find('.js-selected-adding-all').val()) {
            // 加算の空プルダウンが存在しているなら、blank_objに入れる
            blank_obj = $(this);
        }
    });

    // 引数 data がない、もしくは null の場合
    if (!data) {
        // 削除処理を実行
        if (adding3_obj) {
            adding3_obj.find(del_btn_class).click();
        }

        // 加算項目を非表示状態へ変更(権限：表示しない場合の為)
        if (adding_view_flg === false) {
            $('.js_adding_tr', tbody_obj).hide();
        }
        return;
    }

    // 延長加算追加
    if (data) {
        // 加算項目を表示状態へ変更(権限：表示しない場合の為)
        if (adding_view_flg === false) {
            $('.js_adding_tr', tbody_obj).show();
        }

        if (!adding3_obj) {
            // 空プルダウンがあれば、値を設定する
            if (blank_obj) {
                blank_obj.find('.js-selected-adding-all').val('3').change();
                var adding3_obj_new = blank_obj;
            } else {
                // 追加ボタンがあれば
                if ($(add_btn_class + ':last', tbody_obj).length) {
                    $(add_btn_class + ':last', tbody_obj).click();
                    $('.js-selected-adding-all:last', tbody_obj).val('3').change();
                    var adding3_obj_new = $('.js-selected-adding-all:last', tbody_obj);
                }
            }

            if (!data[9]) {
                for (let index = 0; index < 8; index++) {
                    adding3_obj_new.closest('tr').find('.js_adding_time').eq(index).val(parseInt(data[index + 1]));
                }
            }
        } else {
            // 時間だけ変更する
            if (!data[9]) {
                for (let index = 0; index < 8; index++) {
                    adding3_obj.find('.js_adding_time').eq(index).val(parseInt(data[index + 1]));
                }
            }
        }

        // 「延長支援加算を算定する」をクリックしたフラグを立てる
        $('[name=extension_support_err_two_click_flag]').val(1);
    }
    // 最後に警告文を非表示へ
    $('.js-extension-support').hide();
}

// 各変数を2桁に変換する関数
function formatTwoDigits(number) {
    // 1桁の場合は0を付ける
    return number < 10 ? '0' + number : number;
}

/**
 * 延長支援加算の登録処理（一覧）
 * 登録成功時には一覧画面の加算情報がリロードされ、必要に応じてUIの更新も行う。
 *
 * @param {string} date - 対象の日付
 * @param {number} childId - 児童ID
 * @param {number} f_id - 施設ID
 * @param {Array} form_ary - 申し込みID,サービスNo、延長支援時間
 *
 * @returns {void} - この関数は値を返さない
 */
function setRelatedExtensionDetail (date, childId, f_id, form_ary) {
    let select_date_ary = date.split('-');
    let start_date = new Date(select_date_ary[0], select_date_ary[1] -1, select_date_ary[2], 0, 0, 0);
    // 2024年度法改正チェック日付
    let checkDate2024 = new Date(2024, 3, 1, 0, 0, 0);
    // 2024/04以降のみ連動の表示をするので日付判定
    if (start_date >= checkDate2024) {
        //延長支援加算の連動ここから
        let url = "./ajax/ajax_extension.php";

        $.ajax({
            type: 'post',
            url: url,
            timeout: 12000,
            dataType: 'json',
            data: {
                "mode": 'detail_save',
                "date": date,
                "c_id": childId,
                "f_id": f_id,
                "form": form_ary,
            },
            success: function (data) {
                // 予約IDを取得
                let reserve_id = form_ary[0];

                // 出席実績タブの更新「延長支援加算有」緑アイコンの表示
                if (data) {
                    // 加算が算定された場合
                    $(`.children${reserve_id}`).find('.js_utilization_time').parent().addClass('extraTime');
                } else {
                    // 加算が算定されなかった場合
                    $(`.children${reserve_id}`).find('.js_utilization_time').parent().removeClass('extraTime');
                }

                //一覧画面の加算リロード
                //要素をloadする
                $.ajax({
                    type: 'GET',
                    url: 'attendance.php?mode=detail&date=' + date,
                    dataType: 'html',
                    success: function(data) {
                        // 加算実績タブ画面の更新
                        $(`#js_adding_list${reserve_id}`).html($(data).find(`#js_adding_list${reserve_id}`).html());
                    }
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("XMLHttpRequest : " + XMLHttpRequest.status);
                console.log("textStatus     : " + textStatus);
                console.log("errorThrown    : " + errorThrown.message);
                alert("通信に失敗しました。");
            }
        });
    }
}


/**
 * 延長支援加算算定するかのチェック処理（一覧、一括編集）
 * 児童情報、支援時間情報を使って延長支援情報を取得
 * 延長支援時間と、モーダルを表示するか否かの値を返す
 * 成功時にはコールバック関数にデータを渡し、失敗時にはデフォルトのオブジェクトを返す。
 *
 * @param {number} childId - 児童ID
 * @param {number} f_id - 施設ID
 * @param {number} r_id - 申し込みID
 * @param {string} date - 年月日
 * @param {string} enter_time_hi - 入室時間
 * @param {string} leave_time_hi - 退室時間
 * @param {null} providing_type - 提供形態
 * @param {string} display_mode - 実行画面(一覧：detail, 一括：allEdit)
 * @param {string} change_attendance_flg - 30分未満のため実績時間を変更したフラグ(一覧の場合のみ取得)
 * @param {function} callback - データ取得後に実行されるコールバック関数。取得データと計算に必要な配列を引数に渡す
 * @returns {void} この関数は値を返さない
 */
function getDetailExtensionData (childId, f_id, r_id, date, enter_time_hi, leave_time_hi, providing_type, display_mode, change_attendance_flg, callback) {
    // 一覧の場合延長支援情報一時保存用の要素内をリセット
    if (display_mode === 'detail') {
        $(`#extension_support_save_${r_id}`).attr({'data-r_id': '',});

        // 延長支援加算の時間をリセット（時間1の開始時間と終了時間、時間2の開始時間と終了時間）
        for (let i = 1; i <= 8; i++) {
            $(`#extension_support_save_${r_id}`).attr(`data-exTime${i}`, '');
        }
    }

    // 延長支援の連動処理
    let form_ary = [];
    form_ary.push(r_id);  // 予約ID

    // 入室時間を整形 正しい時間の形でなければ空文字をセット
    let enter_timeSet = validateTimeFormat(enter_time_hi);
    let enter_time = enter_timeSet ? enter_time_hi : '';
    form_ary.push(enter_time);

    // 退室時間を整形 正しい時間の形でなければ空文字をセット
    let leave_timeSet = validateTimeFormat(leave_time_hi);
    let leave_time = leave_timeSet ? leave_time_hi : '';
    form_ary.push(leave_time);

    // 個別支援計画別表の延長支援設定を取得
    let extension_time_plan = 0;  // デフォルト値
    let extension_time_plan_holiday_flg = 0;  // デフォルト値
    if (display_mode === 'detail') {
        // 一覧画面の場合
        extension_time_plan = $(`.children${r_id}`).data('extension_time_plan') ? 1 : 0;
        extension_time_plan_holiday_flg = (parseInt($(`.children${r_id}`).data('extension_time_plan_holiday')) === 1) ? 1 : 0;
    } else if (display_mode === 'allEdit') {
        // 一括画面の場合
        extension_time_plan = $(`[name="list[${r_id}][extension_time_plan_flg]"]`).val() ? 1 : 0;
        extension_time_plan_holiday_flg = (parseInt($(`[name="list[${r_id}][extension_time_plan_holiday_flg]"]`).val()) === 1) ? 1 : 0;
    }
    // 提供形態が学休日で平日の場合、延長支援設定も学休日のものへ書き換える
    if (parseInt(providing_type) === 2 && IS_HOLIDAY === false) {
        extension_time_plan = extension_time_plan_holiday_flg;
    }
    form_ary.push(extension_time_plan);

    // 一括編集の場合のみ、提供形態を配列へ格納
    if (display_mode === 'allEdit') {
        let providing_type_val = providing_type ? providing_type : null;
        form_ary.push(providing_type_val);
        form_ary.push('all_edit'); // 一括編集（個人）の場合処理を分岐する用
    } else {
        // 一覧の場合は後に登録情報から提供形態取得するため未格納
        form_ary.push(null);
        form_ary.push(display_mode);
    }

    // 一覧にて、30分未満のため入退室時間を変更している場合フラグを格納
    if (display_mode === 'detail') {
        form_ary.push(change_attendance_flg);
    }

    let select_date_ary = date.split('-');
    let start_date = new Date(select_date_ary[0], select_date_ary[1] - 1, select_date_ary[2], 0, 0, 0);
    let check_date2024 = new Date(2024, 3, 1, 0, 0, 0);
    if (start_date >= check_date2024) {
        let url = "./ajax/ajax_extension.php";

        $.ajax({
            type: 'post',
            url: url,
            timeout: 12000,
            dataType: 'json',
            data: {
                "mode": 'detail_setting',
                "date": date,
                "c_id": childId,
                "f_id": f_id,
                "form": form_ary,
            },
            success: function (data) {
                // モーダルが必要か、モーダルの表示メッセージは何かを格納
                //（no_plan_time：「延長支援の計画がありません」　30min_1hour：「延長した支援時間が30分以上、1時間未満になっています）
                let modal_type = (data && data['modal_message']) ? data['modal_message'] : null;
                callback({ modal_type, data, form_ary }); // modal_typeとdataをオブジェクトとして返す
            },
            error: function () {
                console.error("通信に失敗しました。");
                callback({ modal_type: null, data: null, form_ary }); // エラー時はmodal_typeを0として返す
            }
        });
    } else {
        callback({ modal_type: null, data: null, form_ary }); // 2024年4月以前もmodal_typeを0として返す
    }
}

/**
 * 延長支援加算モーダルを表示する関数
 * getDetailExtensionData関数で取得した延長支援情報を元にモーダルを表示
 *
 * @param {number} f_id - 施設ID
 * @param {Object} data - 取得した延長支援情報
 * @param {Array} form_ary - getDetailExtensionData関数で利用した引数
 * @param {boolean|null} [providing_flg=null] - 一覧画面の提供形態ボタンを押下した場合フラグが入る
 * @param {boolean|null} [allEditFlg=null] - 一括編集画面の場合フラグが入る
 * @param {string} change_detail_attendance_flg - 30分未満のため実績時間を変更したフラグ(一覧の場合のみ取得)
 * @returns {void}
 *
 */
// 延長支援加算モーダルを表示する関数
function showExtensionModal(f_id, data, form_ary, providing_flg = false, display_mode, change_attendance_flg) {
    // 入室時間を成形
    let enter_time_parts = form_ary[1].split(":");
    let enter_hour = parseInt(enter_time_parts[0]);
    let enter_min = parseInt(enter_time_parts[1]);
    let enter_time = `${formatTwoDigits(enter_hour)}${formatTwoDigits(enter_min)}`;

    // 退室時間を成形
    let leave_time_parts = form_ary[2].split(":");
    let leave_hour = parseInt(leave_time_parts[0]);
    let leave_min = parseInt(leave_time_parts[1]);
    let leave_time = `${formatTwoDigits(leave_hour)}${formatTwoDigits(leave_min)}`;

    // 延長支援時間を成形
    let ex_time1 = data[1] ? data[1] : '';
    let ex_time2 = data[2] ? data[2] : '';
    let ex_time3 = data[3] ? data[3] : '';
    let ex_time4 = data[4] ? data[4] : '';
    let ex_time5 = data[5] ? data[5] : '';
    let ex_time6 = data[6] ? data[6] : '';
    let ex_time7 = data[7] ? data[7] : '';
    let ex_time8 = data[8] ? data[8] : '';
    let ex_time10 = data[10] ? formatTwoDigits(data[10]) : '';

    // 延長支援時間が取得できていればモーダルへ送る（例：11時00分～14時00分の場合は'11001400'）
    let ex_time1_set = (ex_time1 && ex_time2 && ex_time3 && ex_time4) ? `&ex_time1=${ex_time1}${ex_time2}${ex_time3}${ex_time4}` : '';
    let ex_time2_set = (ex_time5 && ex_time6 && ex_time7 && ex_time8) ? `&ex_time2=${ex_time5}${ex_time6}${ex_time7}${ex_time8}` : '';

    // 延長支援加算時間が30分以上1時間未満の場合、分数をモーダルへ送る
    let ex_time10_set = (ex_time10) ? `&ex_time10=${ex_time10}` : '';

    // 処理の実行が提供形態押下後の場合フラグを送る
    let providing_flg_set = (providing_flg) ? `&providing_flg=1` : '';

    // 処理の実行が一括編集画面の場合提供形態の値を送る
    let providing_val_set = (display_mode === 'all_edit') ? `&providing_val=${form_ary[4]}` : '';

    // 処理の実行が一括編集画面の場合はフラグを送る
    let display_mode_set = (display_mode) ? `&display_mode=${display_mode}` : '';

    // 一覧画面の場合且つ、30分未満のため実績時間を変更していない場合フラグを送る
    let change_attendance_flg_set = (display_mode === 'detail' && change_attendance_flg !== 1) ? `&change_attendance_flg=1` : '';

    // URLへ児童情報、モーダル情報、延長支援時間情報、入退室時間情報をセット
    let modal_url = `attendance.php?mode=view_extension_modal&r_id=${form_ary[0]}&f_id=${f_id}&modal_type=${data['modal_message']}&e_time=${enter_time}&l_time=${leave_time}${providing_flg_set}${providing_val_set}${display_mode_set}${change_attendance_flg_set}${ex_time1_set}${ex_time2_set}${ex_time10_set}`;

    $.magnificPopup.open({
        items: {
            src: modal_url
        },
        type: 'iframe',
        mainClass: 'mfp-fade cbm',
        removalDelay: 0,
        fixedContentPos: true,
        showCloseBtn: true,
        closeBtnInside: true,
        callbacks: {
            open: function() {
                $('.mfp-iframe').on('load', function() {
                    // モーダル上で表示している延長支援時間に応じて警告文の表示、保存ボタンの状態変更する関数実行
                    const modal_window = this.contentWindow;
                    // 関数が存在する場合に実行
                    if (typeof modal_window.checkExtensionSupportTimeModal === 'function') {
                        modal_window.checkExtensionSupportTimeModal();
                    }
                });
            },
            close: function() {
            }
        }
    });
}

/**
 * 一括編集（反映ではない）の延長支援加算の挿入処理
 * 引数の情報を使って加算項目の延長支援加算を更新する
 *
 * @param {number} r_id - 申し込みID
 * @param {Array} data - 延長支援時間情報
 * @param {boolean} is_modal - モーダル上 OR 画面上で実行するかの判断用
 *
 * @returns {void} - 関数は画面操作を行うため、戻り値はありません。
 */
function setExtensionTimeAllDetail(r_id, data, is_modal = false) {
    // modal空の実行の場合はモーダル外の要素にアクセスするため、windowオブジェクトを取得
    const window_type = is_modal ? window.parent.$ : window.$;

    // 加算項目管理の表示権限を取得（表示しない場合は0）
    const id_name = window_type(`#js_related_class${r_id}`);
    // 加算項目の編集権限の有無チェック
    const no_edit_adding_flg =  window_type('[name="list[' + r_id + '][adding_edit_flg]"]').val() === '1' ? false : true;

    // 初期化
    let adding3_obj = '';
    let blank_obj = '';
    let no_edit_extension_obj = '';

    // 要素を取得
    let tbody_obj = window_type('#js_related_class' + r_id);

    // 延長支援加算、空プルダウンのチェック
    window_type('.js_adding_tr', tbody_obj).each(function () {
        if (window_type(this).find('.js-selected-adding-all').val() == 3) {
            // 延長支援加算すでに選択されている場合、adding3_objに入れる
            adding3_obj = window_type(this);
        }
        if (!window_type(this).find('.js-selected-adding-all').val()) {
            // 加算の空プルダウンが存在しているなら、blank_objに入れる
            blank_obj = window_type(this);
        }
    });

    // 算定するフラグをリセット
    window_type('[name="list['+r_id+'][extension_calcu_flg]"]').val('');

    // 権限：閲覧or表示しない の場合
    if (no_edit_adding_flg) {
        // 挿入先の要素を取得
        const form_obj = window_type('#form_id');

        // 延長支援時間情報用の要素を作成して挿入
        no_edit_extension_obj = form_obj.find(`#hidden-extension-data-${r_id}`);
        if (!no_edit_extension_obj.length) {
            no_edit_extension_obj = window_type('<input>', {
                type: 'hidden',
                id: `hidden-extension-data-${r_id}`,
                name: `list[${r_id}][hidden_extension_data]`,
                value: '',
            });
            form_obj.append(no_edit_extension_obj);
        }
    }

    // 延長時間があれば加算項目へ挿入する処理
    if (data) {
        // 延長支援加算が未選択の場合
        let adding3_obj_new;
        if (!adding3_obj) {
            // 空プルダウンがあれば、値を設定する
            if (blank_obj.length) {
                blank_obj.find('.js-selected-adding-all').val('3').change();
                adding3_obj_new = blank_obj;
            } else if (window_type('.js_add:last', tbody_obj).length) {
                // 追加ボタンがあればクリックして値を設定
                window_type('.js_add:last', tbody_obj).click();
                window_type('.js-selected-adding-all:last', tbody_obj).val('3').change();
                adding3_obj_new = window_type('.js-selected-adding-all:last', tbody_obj);
            }

            if (adding3_obj_new) {
                for (let index = 0; index < 8; index++) {
                    adding3_obj_new.closest('tr').find('.js_adding_time').eq(index).val(parseInt(data[index + 1]));
                }
            }
        } else {
            // 延長支援加算が選択済みの場合、時間だけ変更する
            for (let index = 0; index < 8; index++) {
                adding3_obj.find('.js_adding_time').eq(index).val(parseInt(data[index + 1]));
            }
        }

        // 権限：閲覧or表示しない の場合
        if (no_edit_adding_flg) {
            // 専用要素へ延長支援時間情報を挿入
            no_edit_extension_obj.val(JSON.stringify(data));
        }

        // 緑アイコン延長支援加算有を追加
        window_type(`.js_children_area${r_id}`).find('.js_utilization_time').parent().addClass('extraTime');
        //算定するフラグ
        window_type('[name="list['+r_id+'][extension_calcu_flg]"]').val(1);

    } else {
        // 延長支援加算が登録されているなら削除する
        if (adding3_obj.length) {
            adding3_obj.find('.js_delete').click();
        }

        // 権限：閲覧or表示しない の場合
        if (no_edit_adding_flg && no_edit_extension_obj.length) {
            // 専用要素を削除
            no_edit_extension_obj.remove();
        }

        // 緑アイコン延長支援加算有を削除
        window_type(`.js_children_area${r_id}`).find('.js_utilization_time').parent().removeClass('extraTime');
        //算定しないフラグ
        window_type('[name="list['+r_id+'][extension_calcu_flg]"]').val(2);
    }
}

/**
 * 延長支援時間モーダル（一覧）上の延長支援時間の合計を計算し、保存ボタンや警告メッセージの表示状態を設定
 * @returns {void}
 */
function checkExtensionSupportTimeModal() {
    // 最初の全ての警告文を非表示にする
    $('.red').eq(0).hide();
    $('.red').eq(1).hide();
    $('.red').eq(2).hide();
    $('.red').eq(3).hide();
    $('.red').eq(4).hide();

    // 日付の取得
    let select_date = $('[name="extension_date"]').val();

    // ラジオボタンの値取得
    let check_extension_addition = $('[name="check_extension_addition"]:checked').val();

    // 実績時間の値を取得
    let display_hour1 = $('input[name="display_hour1"]').val();
    let display_min1 = $('input[name="display_min1"]').val();
    let display_hour2 = $('input[name="display_hour2"]').val();
    let display_min2 = $('input[name="display_min2"]').val();

    // 実績の開始と終了時間を値へ変換
    let displayStart_time = parseInt(display_hour1, 10) * 60 + parseInt(display_min1, 10);
    let displayEnd_time = parseInt(display_hour2, 10) * 60 + parseInt(display_min2, 10);

    // 延長支援時間１と２をループする用のクラス名
    let class_names = ['js_extension_time', 'js_extension_time2'];

    // 延長支援時間の合計差分時間
    let total_diff_check_time = 0;

    // 延長支援時間重複チェック用の、延長支援時間1格納変数
    let value_start_time_one;
    let value_end_time_one;

    // 保存ボタンの非活性可フラグ（初期値は非活性にしない）
    let save_button_disabled = false;

    let loop_counter = 0; // 延長支援時間判断用

    // 延長支援時間1と2のループ処理
    class_names.forEach(class_name => {
        let values = [];
        let has_empty = false;

        // 延長支援時間を配列へ格納
        $('.' + class_name).each(function () {
            let value = $(this).val();
            if (value) {
                values.push(value);
            } else {
                // 値が空の場合は空文字を格納
                values.push('');
                has_empty = true;
            }
        });

        // 取得した延長支援時間が全て空かチェック
        if (values.every(val => val === '')) {
            // 全て空の場合は値を書き換える
            values = null;
            has_empty = false;
        }

        // 開始、終了時間全ての値が入っている場合
        if (values && values.length === 4 && !has_empty) {
            // 延長支援時間の差分を取得
            let diff_check_time = checkAttendanceDiffTime(select_date, values[0], values[1], values[2], values[3]);

            // 延長支援時間の差分の合計を計算
            total_diff_check_time += diff_check_time;

            // 延長支援時間の開始と終了時間を値へ変換
            let value_start_time = parseInt(values[0], 10) * 60 + parseInt(values[1], 10);
            let value_end_time = parseInt(values[2], 10) * 60 + parseInt(values[3], 10);

            // 延長支援時間の重複チェック開始
            if (loop_counter === 0) {
                // 延長支援時間1の場合、開始と終了時間を変数へ格納
                value_start_time_one = value_start_time;
                value_end_time_one = value_end_time;

            } else if (loop_counter === 1 && value_start_time_one && value_end_time_one) {
                // 延長支援時間2の場合且つ、延長支援時間1が入力状態の場合
                if ((value_start_time_one <= value_start_time && value_start_time < value_end_time_one) ||
                    (value_start_time_one < value_end_time && value_end_time <= value_end_time_one) ||
                    (value_start_time_one >= value_start_time && value_end_time_one <= value_end_time))
                {
                    // 延長支援時間が重複している場合は警告文を表示
                    $('.red').eq(`${loop_counter}`).show();
                    save_button_disabled = true;
                }
            }

            // 延長支援時間の不正チェック開始（10時～9時等）
            let check_time = parseInt(value_end_time, 10) - parseInt(value_start_time, 10);
            if (check_time <= 0) {
                // 時間が誤っている警告文表示
                $('.red').eq(0).show();
                save_button_disabled = true;
            }

            // 実績の入室時間より延長支援時間の開始時間が早い場合、もしくは実績の退室時間より延長支援時間の終了時間が遅い場合は警告文を表示
            if ((displayStart_time > value_start_time) || (displayEnd_time < value_end_time)) {
                $('.red').eq(4).show();
            }
        }

        // 開始か終了時間片方、または中途半端に値が入っている場合
        if (values && has_empty) {
            // 時間が誤っている警告文表示
            $('.red').eq(0).show();
            save_button_disabled = true;
        }

        // カウントを追加
        loop_counter++;
    });

    // この時点で保存ボタンが非活性の場合（不正な時間OR重複した時間）のエラーチェック実行
    if (save_button_disabled === false) {
        // 延長支援時間の差分の合計によって警告文の表示操作
        if (total_diff_check_time >= 30 && total_diff_check_time < 60) {
            // 延長支援時間の合計が30分以上1時間未満の場合
            $('.red').eq(2).show();
            $('.red').eq(3).hide();
        } else if (total_diff_check_time < 30) {
            // 延長支援時間の合計が30分未満の場合
            $('.red').eq(2).hide();
            $('.red').eq(3).show();
        } else {
            $('.red').eq(2).hide();
            $('.red').eq(3).hide();
        }
    }

    // 延長支援加算の連動設定が「加算連動しない」の場合は保存ボタンを活性化させ、警告文も非表示
    if (check_extension_addition == '0') {
        save_button_disabled = false;
        for (let i = 0; i <= 4; i++) {
            $('.red').eq(i).hide();
        }
    }

    // 保存ボタンの活性/非活性状態を設定
    if (save_button_disabled) {
        $('.js-modalExtensionSave').addClass('disable');
    } else {
        $('.js-modalExtensionSave').removeClass('disable');
    }
}

/**
 * 時間フォーマット（hh:mm）の検証を行う関数
 * 指定された文字列が「hh:mm」の形式であるかを確認
 * 主に不適切な形式を判断（空時間+:+分数、時間+:+空分数の場合などを判断）
 * @param {string} time - 検証対象の時間文字列（例: "12:30"）
 * @returns {boolean} フォーマットが正しい場合は `true`、不正な場合は `false` を返す
 */
function validateTimeFormat(time) {
    // 「:」で分割して、2つのパーツ（時と分）を取得
    const parts = time.split(":");

    // 「時」と「分」が2つあり、空でなく数字かどうかをチェック
    if (parts.length === 2 && parts[0] !== '' && parts[1] !== '' && $.isNumeric(parts[0]) && $.isNumeric(parts[1])) {
        return true; // 正しいフォーマットならそのまま返す
    } else {
        return false; // 不正なフォーマットの場合は空にする
    }
}

/**
 * 与えられた日付が土日かどうかを判定する関数
 * @param {string} date_string - 判定する日付（YYYY-MM-DD形式）
 * @returns {boolean} is_holiday - 土日祝日の場合は `true`、それ以外は `false` を返す
 */
function isWeekend(date_string) {
    let is_holiday = false;
    const date = new Date(date_string);

    if (isNaN(date.getTime())) {
        throw new Error("無効な日付形式です。YYYY-MM-DD形式で指定してください。");
    }

    const day_of_week = date.getDay();

    // 土日か判定
    // 0: 日曜日, 6: 土曜日
    if (day_of_week === 0 || day_of_week === 6) {
        is_holiday = true;
    }

    return is_holiday;
}
