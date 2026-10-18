/* Зерде — настройки подключения.
 * Пусто → демо-режим (аккаунты в браузере). Для настоящего запуска впишите данные проекта Supabase
 * (Project Settings → API): URL и anon public key. Это публичный ключ — его можно хранить в коде;
 * защита данных — в правилах базы (supabase/schema.sql). service_role key сюда НЕ вписывать никогда. */
window.Z = window.Z || {};
window.Z.config = { supabaseUrl: '', supabaseKey: '' };
