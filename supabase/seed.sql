-- Seed sample cars (replace with real Supabase Storage URLs for images)
insert into public.cars (name, slug, brand, model, year, description, daily_price, weekend_price, transmission, fuel_type, seats, color, featured, status)
values
  ('Rolls-Royce Ghost', 'rolls-royce-ghost', 'Rolls-Royce', 'Ghost', 2023, 'The epitome of luxury motoring. The Ghost delivers a supremely refined experience with its 6.75L V12 engine and bespoke interior.', 1200, 1500, 'Automatic', 'Petrol', 4, 'Midnight Black', true, 'available'),
  ('Lamborghini Urus', 'lamborghini-urus', 'Lamborghini', 'Urus', 2024, 'The world''s most powerful production SUV. Combining supercar performance with everyday practicality.', 950, 1200, 'Automatic', 'Petrol', 5, 'Pearl White', true, 'available'),
  ('Ferrari Roma', 'ferrari-roma', 'Ferrari', 'Roma', 2023, 'A front-engined V8 GT that combines extraordinary performance with timeless Italian style.', 1100, 1400, 'Automatic', 'Petrol', 2, 'Rosso Corsa', true, 'available'),
  ('Bentley Bentayga', 'bentley-bentayga', 'Bentley', 'Bentayga', 2024, 'The definitive luxury SUV, offering unmatched refinement and commanding presence.', 890, 1100, 'Automatic', 'Hybrid', 5, 'Verdant', false, 'available'),
  ('McLaren 720S', 'mclaren-720s', 'McLaren', '720S', 2022, 'A mid-engine supercar delivering breathtaking performance through cutting-edge technology.', 1350, 1700, 'Automatic', 'Petrol', 2, 'Papaya Spark', false, 'available'),
  ('Mercedes S-Class', 'mercedes-s-class', 'Mercedes', 'S-Class', 2024, 'The pinnacle of executive travel. Effortless power, opulent comfort, cutting-edge technology.', 620, 780, 'Automatic', 'Hybrid', 5, 'Obsidian Black', false, 'available');
