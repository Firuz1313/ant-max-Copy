-- ANT Support Database - Diagnostic Steps and Marking System
-- Migration: 011_diagnostic_steps_and_marks.sql
-- This migration adds diagnostic steps with real remote/interface marking

-- ========================================
-- SECTION 1: INSERT DIAGNOSTIC STEPS
-- ========================================

INSERT INTO diagnostic_steps (id, problem_id, title, description, instruction, step_type, order_index, expected_result, is_critical, estimated_time, success_rate, difficulty, tools_required, safety_notes, is_active, metadata) VALUES

-- Шаги для "Отсутствует видеосигнал" (ANT HD-1000 Pro)
('step-ant-hd1000-video-001', 'problem-ant-hd1000-no-video', 'Проверка подключения HDMI кабеля', 'Визуальная проверка физического подключения HDMI кабеля к приставке и телевизору', 
 'Осмотрите HDMI кабель, соединяющий приставку с телевизором. Убедитесь, что кабель плотно вставлен в разъемы на обеих сторонах. Попробуйте отключить и подключить кабель заново, услышав характерный щелчок.',
 'check', 1, 'HDMI кабель надежно закреплен в разъемах, нет видимых повреждений разъемов или кабеля', true, 3, 95, 'beginner',
 '[]', '["Не применяйте чрезмерную силу при подключении", "Убедитесь что устройства выключены при переподключении"]', true, 
 '{"cable_inspection": true, "physical_check": true, "connector_type": "HDMI"}'),

('step-ant-hd1000-video-002', 'problem-ant-hd1000-no-video', 'Переключение входа на телевизоре', 'Выбор правильного HDMI входа на телевизоре с помощью пульта ТВ',
 'Возьмите пульт от телевизора и нажмите кнопку INPUT или SOURCE. В появившемся меню выберите HDMI вход, к которому подключена приставка (обычно HDMI1, HDMI2, HDMI3 или HDMI4). Подождите 2-3 секунды для переключения.',
 'action', 2, 'На экране телевизора появилось изображение с приставки ANT или экран загрузки', true, 2, 92, 'beginner',
 '["tv_remote"]', '[]', true,
 '{"tv_settings": true, "input_selection": true, "requires_tv_remote": true}'),

('step-ant-hd1000-video-003', 'problem-ant-hd1000-no-video', 'Проверка питания приставки', 'Контроль индикаторов питания и перезагрузка устройства',
 'Найдите индикатор питания на передней панели приставки ANT. Он должен светиться синим или зеленым цветом. Если индикатор не горит, проверьте подключение кабеля питания. Если горит красным, выполните перезагрузку: отключите питание на 10 секунд, затем включите.',
 'action', 3, 'Индикатор питания светится стабильно, приставка отвечает на команды пульта', true, 5, 88, 'beginner',
 '[]', '["Подождите полной загрузки системы (1-2 минуты)", "Не отключайте питание во время загрузки"]', true,
 '{"power_indicator": true, "system_reboot": true, "led_status": true}'),

-- Шаги для "Зависание при загрузке Android TV" (ANT 4K Ultra)
('step-ant-4k-boot-001', 'problem-ant-4k-boot-freeze', 'Принудительная перезагрузка системы', 'Выполнение "жесткой" перезагрузки Android TV системы',
 'Отключите приставку от сети питания, подождите 30 секунд. Подключите обратно и включите. Если система снова зависает на загрузке, повторите процедуру еще раз, но подождите уже 60 секунд перед включением.',
 'action', 1, 'Система Android TV загружается нормально и показывает главный экран', true, 8, 75, 'beginner',
 '[]', '["Дождитесь полного отключения перед повторным включением", "Не прерывайте процесс загрузки"]', true,
 '{"hard_reboot": true, "android_specific": true, "power_cycle": true}'),

('step-ant-4k-boot-002', 'problem-ant-4k-boot-freeze', 'Загрузка в безопасном режиме', 'Запуск Android TV в безопасном режиме для диагностики',
 'Включите приставку и сразу после появления логотипа ANT нажмите и удерживайте кнопку "OK" на пульте в течение 10 секунд. Отпустите кнопку когда увидите надпись "Safe Mode" в углу экрана.',
 'action', 2, 'Система загрузилась в безопасном режиме, в углу экрана видна надпись "Safe Mode"', false, 5, 70, 'intermediate',
 '[]', '["Удерживайте кнопку ровно 10 секунд", "Не нажимайте другие кнопки во время процедуры"]', true,
 '{"safe_mode": true, "android_diagnostics": true, "timing_critical": true}'),

('step-ant-4k-boot-003', 'problem-ant-4k-boot-freeze', 'Очистка кэша системы', 'Сброс системного кэша Android TV через меню восстановления',
 'Выключите приставку. Нажмите и удерживайте одновременно кнопки "Power" + "OK" на пульте, включите приставку. Удерживайте кнопки до появления меню Recovery. Выберите "Wipe Cache Partition" стрелками и подтвердите кнопкой OK.',
 'action', 3, 'Кэш очищен успешно, система загружается в нормальном режиме', false, 15, 65, 'advanced',
 '[]', '["Точно следуйте последовательности кнопок", "Не выбирайте Factory Reset без крайней необходимости"]', true,
 '{"recovery_mode": true, "cache_wipe": true, "advanced_procedure": true}'),

-- Шаги для "Пульт не реагирует" (ANT HD-1000 Pro)
('step-ant-hd1000-remote-001', 'problem-ant-hd1000-remote-unresponsive', 'Замена батареек в пульте', 'Проверка и замена элементов питания в пульте дистанционного управления',
 'Откройте крышку батарейного о��сека на задней стороне пульта. Извлеките старые батарейки и вставьте новые AAA батарейки, соблюдая полярность (+ и -). Закройте крышку и проверьте работу пульта.',
 'action', 1, 'Пульт реагирует на нажатия кнопок, приставка отвечает на команды', true, 3, 85, 'beginner',
 '["new_aaa_batteries"]', '["Соблюдайте полярность батареек", "Используйте качественные батарейки"]', true,
 '{"battery_replacement": true, "polarity_check": true, "hardware_fix": true}'),

('step-ant-hd1000-remote-002', 'problem-ant-hd1000-remote-unresponsive', 'Проверка направления и расстояния', 'Оптимизация положения пульта относительно приставки',
 'Направьте пульт прямо на переднюю панель приставки с расстояния 2-3 метра. Убедитесь, что между пультом и приставкой нет препятствий (мебель, декор, другие устройства). Попробуйте использовать пульт с разных позиций.',
 'check', 2, 'Приставка стабильно реагирует на команды пульта с расстояния до 5 метров', false, 2, 95, 'beginner',
 '[]', '[]', true,
 '{"line_of_sight": true, "distance_optimization": true, "ir_communication": true}'),

('step-ant-hd1000-remote-003', 'problem-ant-hd1000-remote-unresponsive', 'Повторное сопряжение пульта с приставкой', 'Переподключение пульта к приставке через процедуру сопряжения',
 'Находясь рядом с приставкой, одновременно нажмите и удерживайте кнопки "OK" и "BACK" на пульте в течение 5 секунд. Отпустите кнопки и подождите. На экране должно появиться сообщение об успешном сопряжении.',
 'action', 3, 'На экране появилось подтверждение сопряжения, пульт работает стабильно', false, 5, 80, 'intermediate',
 '[]', '["Точно удерживайте кнопки 5 секунд", "Находитесь на расстоянии не более 1 метра от приставки"]', true,
 '{"pairing_procedure": true, "button_combination": true, "proximity_required": true}'),

-- Шаги для универсальных проблем Wi-Fi
('step-universal-wifi-001', 'problem-universal-wifi-connection', 'Перезагрузка сетевого оборудования', 'Перезапуск роутера и модема для восстановления соединения',
 'Отключите роутер и модем от питания на 30 секунд. Сначала включите модем, дождитесь его полной загрузки (2 минуты). Затем включите роутер и дождитесь стабилизации всех индикаторов (еще 2 минуты).',
 'action', 1, 'Индикаторы роутера показывают стабильное подключение к интернету', true, 5, 80, 'beginner',
 '[]', '["Соблюдайте последовательность включения", "Не торопитесь с включением роутера"]', true,
 '{"network_equipment": true, "reboot_sequence": true, "timing_important": true}'),

('step-universal-wifi-002', 'problem-universal-wifi-connection', 'Проверка пароля Wi-Fi сети', 'Повторное подключение к Wi-Fi с проверкой учетных данных',
 'В настройках сети устройства найдите вашу Wi-Fi сеть, выберите "Забыть сеть" или "Удалить". Затем найдите сеть заново в списке доступных и подключитесь, внимательно введя пароль. Пароль чувствителен к регистру.',
 'action', 2, 'Устройство успешно подключилось к Wi-Fi сети и имеет доступ в интернет', true, 8, 85, 'beginner',
 '[]', '["Пароль чувствителен к регистру", "Убедитесь в правильности ввода каждого символа"]', true,
 '{"password_verification": true, "network_reconnection": true, "case_sensitive": true}'),

('step-universal-wifi-003', 'problem-universal-wifi-connection', 'Проверка мощности Wi-Fi сигнала', 'Диагностика качества беспроводного соединения',
 'В настройках Wi-Fi найдите информацию о силе сигнала вашей сети. Если сигнал слабый (менее 50% или ниже -70 dBm), попробуйте переместить устройство ближе к роутеру или уберите препятствия между ними.',
 'check', 3, 'Сила Wi-Fi сигнала составляет более 60%, соединение стабильное', false, 5, 75, 'beginner',
 '[]', '["Металлические предметы и стены ослабляют сигнал", "Оптимальное расстояние до роутера - до 10 метров"]', true,
 '{"signal_strength": true, "positioning": true, "interference_check": true}');

-- ========================================
-- SECTION 2: INSERT TV INTERFACE MARKS
-- ========================================

INSERT INTO tv_interface_marks (id, tv_interface_id, step_id, name, description, type, x, y, width, height, style, action, order_index, is_active, metadata) VALUES

-- Маркировки для главного меню ANT HD-1000 Pro
('mark-ant-main-live-tv', 'tv-interface-ant-hd1000-main', 'step-ant-hd1000-video-002', 'ТВ Каналы', 'Кликните для перехода к просмотру телевизионных каналов', 'button', 80, 120, 160, 90, 
 '{"border": "3px solid #22c55e", "background": "rgba(34, 197, 94, 0.2)", "pulse": true}', 'highlight_tv_channels', 1, true,
 '{"instruction": "Если изображение появилось, попробуйте открыть ТВ каналы", "step_context": "video_verification"}'),

('mark-ant-main-settings', 'tv-interface-ant-hd1000-main', 'step-ant-hd1000-video-003', 'Настройки', 'Откройте настройки для проверки системной информации', 'button', 80, 250, 160, 90,
 '{"border": "3px solid #3b82f6", "background": "rgba(59, 130, 246, 0.2)", "pulse": true}', 'open_system_settings', 2, true,
 '{"instruction": "Проверьте информацию о системе в настройках", "step_context": "system_verification"}'),

-- Маркировки для Android TV интерфейса (ANT 4K Ultra)
('mark-android-apps', 'tv-interface-ant-4k-home', 'step-ant-4k-boot-001', 'Ваши приложения', 'Если этот раздел отображается, система загрузилась успешно', 'zone', 100, 200, 600, 120,
 '{"border": "3px solid #10b981", "background": "rgba(16, 185, 129, 0.15)", "dashArray": "5,5"}', 'verify_apps_loaded', 1, true,
 '{"instruction": "Убедитесь что приложения отображаются корректно", "step_context": "android_boot_verification"}'),

('mark-android-voice', 'tv-interface-ant-4k-home', 'step-ant-4k-boot-002', 'Голосовой поиск', 'Попробуйте голосовой поиск для проверки системы', 'button', 650, 30, 80, 40,
 '{"border": "3px solid #8b5cf6", "background": "rgba(139, 92, 246, 0.2)", "pulse": true}', 'test_voice_search', 2, true,
 '{"instruction": "Нажмите для проверки голосового поиска", "step_context": "voice_system_test"}'),

-- Маркировки для экрана каналов
('mark-channels-search', 'tv-interface-ant-hd1000-channels', 'step-ant-hd1000-video-002', 'Поиск', 'Используйте поиск для быстрого нахождения каналов', 'button', 550, 50, 90, 30,
 '{"border": "3px solid #f59e0b", "background": "rgba(245, 158, 11, 0.2)", "pulse": true}', 'open_channel_search', 1, true,
 '{"instruction": "Попробуйте найти конкретный канал", "step_context": "channel_navigation"}'),

-- Маркировки для Samsung Smart Hub
('mark-samsung-netflix', 'tv-interface-samsung-smart-hub', null, 'Netflix', 'Запуск приложения Netflix для проверки подключения', 'button', 240, 180, 120, 120,
 '{"border": "3px solid #dc2626", "background": "rgba(220, 38, 38, 0.2)", "pulse": true}', 'launch_netflix_test', 1, true,
 '{"instruction": "Проверьте работу приложений", "app_test": true}'),

-- Маркировки для LG webOS
('mark-lg-live-tv', 'tv-interface-lg-webos', null, 'Live TV', 'Переключение на просмотр телевидения', 'button', 80, 350, 80, 80,
 '{"border": "3px solid #059669", "background": "rgba(5, 150, 105, 0.2)", "pulse": true}', 'switch_to_live_tv', 1, true,
 '{"instruction": "Переключитесь на просмотр ТВ", "tv_function": true}');

-- ========================================
-- SECTION 3: INSERT REMOTE MARKS
-- ========================================

INSERT INTO remote_marks (id, remote_id, step_id, name, description, type, x, y, width, height, style, action, order_index, is_active, metadata) VALUES

-- Маркировки для пульта ANT HD-1000 Pro
('rmark-ant-hd1000-power', 'remote-ant-hd1000-pro', 'step-ant-hd1000-video-003', 'POWER', 'Нажмите для включения/выключения приставки', 'button', 60, 35, 45, 22,
 '{"border": "3px solid #dc2626", "background": "rgba(220, 38, 38, 0.3)", "pulse": true, "fontSize": "12px"}', 'power_device', 1, true,
 '{"instruction": "Нажмите для перезагрузки", "button_type": "power", "critical": true}'),

('rmark-ant-hd1000-ok', 'remote-ant-hd1000-pro', 'step-ant-hd1000-remote-003', 'OK', 'Кнопка ��одтверждения для сопряжения пульта', 'button', 60, 220, 45, 22,
 '{"border": "3px solid #059669", "background": "rgba(5, 150, 105, 0.3)", "pulse": true}', 'confirm_pairing', 1, true,
 '{"instruction": "Удерживайте вместе с BACK", "button_combination": true, "pairing": true}'),

('rmark-ant-hd1000-back', 'remote-ant-hd1000-pro', 'step-ant-hd1000-remote-003', 'BACK', 'Кнопка возврата для сопряжения', 'button', 85, 135, 40, 20,
 '{"border": "3px solid #059669", "background": "rgba(5, 150, 105, 0.3)", "pulse": true}', 'pairing_back', 2, true,
 '{"instruction": "Удерживайте вместе с OK 5 секунд", "button_combination": true, "pairing": true}'),

('rmark-ant-hd1000-source', 'remote-ant-hd1000-pro', 'step-ant-hd1000-video-002', 'SOURCE', 'Переключение источника сигнала', 'button', 60, 65, 45, 18,
 '{"border": "3px solid #3b82f6", "background": "rgba(59, 130, 246, 0.3)", "pulse": true}', 'change_input', 3, true,
 '{"instruction": "Для переключения входа HDMI", "input_selection": true}'),

-- Маркировки для голосового пульта ANT 4K Ultra
('rmark-ant-4k-voice', 'remote-ant-4k-ultra-voice', 'step-ant-4k-boot-002', 'VOICE', 'Голосовое управление для диагностики', 'button', 50, 60, 40, 30,
 '{"border": "3px solid #8b5cf6", "background": "rgba(139, 92, 246, 0.3)", "pulse": true}', 'voice_command', 1, true,
 '{"instruction": "Удерживайте и скажите команду", "voice_control": true, "diagnostic": true}'),

('rmark-ant-4k-touchpad', 'remote-ant-4k-ultra-voice', 'step-ant-4k-boot-001', 'Touchpad', 'Тачпад для навигации по интерфейсу', 'area', 35, 110, 70, 70,
 '{"border": "3px solid #10b981", "background": "rgba(16, 185, 129, 0.2)", "dashArray": "5,5"}', 'navigate_interface', 2, true,
 '{"instruction": "Проведите пальцем для навигации", "touchpad": true, "navigation": true}'),

('rmark-ant-4k-home', 'remote-ant-4k-ultra-voice', 'step-ant-4k-boot-001', 'HOME', 'Возврат на главный экран Android TV', 'button', 80, 200, 30, 18,
 '{"border": "3px solid #059669", "background": "rgba(5, 150, 105, 0.3)", "pulse": true}', 'go_home', 3, true,
 '{"instruction": "Для возврата к главному экрану", "home_button": true}'),

-- Маркировки для Samsung Smart Remote
('rmark-samsung-voice', 'remote-samsung-smart-2023', null, 'VOICE', 'Голосовые команды Samsung', 'button', 45, 50, 35, 25,
 '{"border": "3px solid #6366f1", "background": "rgba(99, 102, 241, 0.3)", "pulse": true}', 'samsung_voice', 1, true,
 '{"instruction": "Скажите: Открыть настройки", "samsung_bixby": true}'),

('rmark-samsung-smart-hub', 'remote-samsung-smart-2023', null, 'Smart Hub', 'Открыть Smart Hub Samsung', 'button', 30, 280, 50, 18,
 '{"border": "3px solid #0ea5e9", "background": "rgba(14, 165, 233, 0.3)", "pulse": true}', 'open_smart_hub', 2, true,
 '{"instruction": "Откройте главное меню", "smart_hub": true}'),

-- Маркировки для LG Magic Remote
('rmark-lg-pointer', 'remote-lg-magic-2023', null, 'Pointer Zone', 'Зона указки Magic Remote', 'area', 50, 95, 35, 40,
 '{"border": "3px solid #f59e0b", "background": "rgba(245, 158, 11, 0.2)", "dashArray": "3,3"}', 'use_pointer', 1, true,
 '{"instruction": "Направьте пульт на экран и двигайте", "magic_pointer": true}'),

('rmark-lg-wheel', 'remote-lg-magic-2023', null, 'Scroll Wheel', 'Колесо прокрутки', 'button', 135, 180, 30, 30,
 '{"border": "3px solid #8b5cf6", "background": "rgba(139, 92, 246, 0.3)", "pulse": true}', 'scroll_content', 2, true,
 '{"instruction": "Прокрутите для навигации", "scroll_wheel": true}'),

('rmark-lg-voice-ai', 'remote-lg-magic-2023', null, 'AI VOICE', 'AI голосовое управление LG', 'button', 50, 60, 35, 25,
 '{"border": "3px solid #10b981", "background": "rgba(16, 185, 129, 0.3)", "pulse": true}', 'lg_ai_voice', 3, true,
 '{"instruction": "Скажите: Найти фильмы", "ai_thinq": true});

COMMIT;
