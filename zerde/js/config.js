/* Зерде — настройки подключения.
 * Пусто → демо-режим (аккаунты в браузере). Для настоящего запуска впишите данные проекта Supabase
 * (Project Settings → API): URL и anon public key. Это публичный ключ — его можно хранить в коде;
 * защита данных — в правилах базы (supabase/schema.sql). service_role key сюда НЕ вписывать никогда. */
window.Z = window.Z || {};
window.Z.config = {
  supabaseUrl: 'https://keggobqsjsmlhkwivkdv.supabase.co',
  // anon public key (role: anon) — публичный по замыслу Supabase; доступ ограничивают RLS-правила в supabase/schema.sql.
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZ2dvYnFzanNtbGhrd2l2a2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NjQ5NTIsImV4cCI6MjEwODM0MDk1Mn0.rkWL63VBR3zw_W953NUmU0-RGAZUSRuLMJI14q_fjE0'
};
// Для разработки и автотестов: адрес с ?demo=1 включает демо-режим (аккаунты только в браузере).
try { if (/[?&]demo=1\b/.test(window.location.search)) window.Z.config = { supabaseUrl: '', supabaseKey: '' }; } catch (e) { /* нет location */ }
