-- Store Rating Platform schema (MySQL 8+ / MariaDB 10.4+)

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name          VARCHAR(60)   NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  address       VARCHAR(400)  NOT NULL,
  role          ENUM('ADMIN', 'USER', 'OWNER') NOT NULL DEFAULT 'USER',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stores (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name       VARCHAR(60)   NOT NULL,
  email      VARCHAR(255)  NOT NULL,
  address    VARCHAR(400)  NOT NULL,
  owner_id   INT UNSIGNED  NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_stores_email (email),
  UNIQUE KEY uq_stores_owner (owner_id),
  KEY idx_stores_name (name),
  CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id)
    REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ratings (
  id         INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED     NOT NULL,
  store_id   INT UNSIGNED     NOT NULL,
  rating     TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ratings_user_store (user_id, store_id),
  KEY idx_ratings_store (store_id),
  CONSTRAINT chk_ratings_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_ratings_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ratings_store FOREIGN KEY (store_id)
    REFERENCES stores (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
