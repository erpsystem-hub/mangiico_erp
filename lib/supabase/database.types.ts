export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bai_viet_danh_sach: {
        Row: {
          don_gia: number
          id: number
          id_nguoi_tao: number
          id_nguon_dang: number
          id_the_loai: number
          id_trang_dang: number
          link: string
          ngay_dang: string
          ten_bai: string
          tg_cap_nhat: string
          tg_tao: string
        }
        Insert: {
          don_gia?: number
          id?: never
          id_nguoi_tao: number
          id_nguon_dang: number
          id_the_loai: number
          id_trang_dang: number
          link: string
          ngay_dang: string
          ten_bai: string
          tg_cap_nhat?: string
          tg_tao?: string
        }
        Update: {
          don_gia?: number
          id?: never
          id_nguoi_tao?: number
          id_nguon_dang?: number
          id_the_loai?: number
          id_trang_dang?: number
          link?: string
          ngay_dang?: string
          ten_bai?: string
          tg_cap_nhat?: string
          tg_tao?: string
        }
        Relationships: [
          {
            foreignKeyName: "bai_viet_danh_sach_id_nguoi_tao_fkey"
            columns: ["id_nguoi_tao"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bai_viet_danh_sach_id_nguon_dang_fkey"
            columns: ["id_nguon_dang"]
            isOneToOne: false
            referencedRelation: "bai_viet_thiet_lap_khac"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bai_viet_danh_sach_id_the_loai_fkey"
            columns: ["id_the_loai"]
            isOneToOne: false
            referencedRelation: "bai_viet_thiet_lap_the_loai"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bai_viet_danh_sach_id_trang_dang_fkey"
            columns: ["id_trang_dang"]
            isOneToOne: false
            referencedRelation: "bai_viet_thiet_lap_khac"
            referencedColumns: ["id"]
          },
        ]
      }
      bai_viet_thiet_lap_khac: {
        Row: {
          id: number
          loai: string
          mo_ta: string | null
          ten: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
        }
        Insert: {
          id?: never
          loai: string
          mo_ta?: string | null
          ten: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Update: {
          id?: never
          loai?: string
          mo_ta?: string | null
          ten?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Relationships: []
      }
      bai_viet_thiet_lap_the_loai: {
        Row: {
          don_gia: number
          id: number
          mo_ta: string | null
          ten_the_loai: string
          tg_cap_nhat: string
          tg_tao: string
        }
        Insert: {
          don_gia?: number
          id?: never
          mo_ta?: string | null
          ten_the_loai: string
          tg_cap_nhat?: string
          tg_tao?: string
        }
        Update: {
          don_gia?: number
          id?: never
          mo_ta?: string | null
          ten_the_loai?: string
          tg_cap_nhat?: string
          tg_tao?: string
        }
        Relationships: []
      }
      chuong_trinh_nam: {
        Row: {
          ghi_chu: string | null
          id: number
          id_nguoi_tao: number
          id_phong_ban: number | null
          mo_ta: string | null
          ngay_bat_dau: string
          ngay_ket_thuc: string
          ten_chuong_trinh: string
          tg_cap_nhat: string
          tg_tao: string
          trang_thai: string
        }
        Insert: {
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao: number
          id_phong_ban?: number | null
          mo_ta?: string | null
          ngay_bat_dau: string
          ngay_ket_thuc: string
          ten_chuong_trinh: string
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Update: {
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao?: number
          id_phong_ban?: number | null
          mo_ta?: string | null
          ngay_bat_dau?: string
          ngay_ket_thuc?: string
          ten_chuong_trinh?: string
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "chuong_trinh_nam_id_nguoi_tao_fkey"
            columns: ["id_nguoi_tao"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chuong_trinh_nam_id_phong_ban_fkey"
            columns: ["id_phong_ban"]
            isOneToOne: false
            referencedRelation: "var_phong_ban"
            referencedColumns: ["id"]
          },
        ]
      }
      cong_viec_danh_sach: {
        Row: {
          ghi_chu: string | null
          id: number
          id_chuong_trinh: number | null
          id_nguoi_tao: number
          id_trach_nhiem: number
          ids_ho_tro: number[]
          ket_qua: string | null
          link_kq: string | null
          link_tai_lieu: string | null
          muc_do: string
          ngay_hoan_thanh: string | null
          ten_cong_viec: string
          tg_cap_nhat: string
          tg_tao: string
          thoi_han: string | null
          tien_do: number
          trang_thai: string
        }
        Insert: {
          ghi_chu?: string | null
          id?: never
          id_chuong_trinh?: number | null
          id_nguoi_tao: number
          id_trach_nhiem: number
          ids_ho_tro?: number[]
          ket_qua?: string | null
          link_kq?: string | null
          link_tai_lieu?: string | null
          muc_do: string
          ngay_hoan_thanh?: string | null
          ten_cong_viec: string
          tg_cap_nhat?: string
          tg_tao?: string
          thoi_han?: string | null
          tien_do?: number
          trang_thai?: string
        }
        Update: {
          ghi_chu?: string | null
          id?: never
          id_chuong_trinh?: number | null
          id_nguoi_tao?: number
          id_trach_nhiem?: number
          ids_ho_tro?: number[]
          ket_qua?: string | null
          link_kq?: string | null
          link_tai_lieu?: string | null
          muc_do?: string
          ngay_hoan_thanh?: string | null
          ten_cong_viec?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thoi_han?: string | null
          tien_do?: number
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "cong_viec_danh_sach_id_chuong_trinh_fkey"
            columns: ["id_chuong_trinh"]
            isOneToOne: false
            referencedRelation: "chuong_trinh_nam"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cong_viec_danh_sach_id_nguoi_tao_fkey"
            columns: ["id_nguoi_tao"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cong_viec_danh_sach_id_trach_nhiem_fkey"
            columns: ["id_trach_nhiem"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
        ]
      }
      kho_danh_muc_hang_hoa: {
        Row: {
          id: number
          mo_ta: string | null
          ten_danh_muc: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
          trang_thai: string
        }
        Insert: {
          id?: never
          mo_ta?: string | null
          ten_danh_muc: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Update: {
          id?: never
          mo_ta?: string | null
          ten_danh_muc?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Relationships: []
      }
      kho_danh_sach_hang_hoa: {
        Row: {
          don_vi_tinh: string
          id: number
          id_danh_muc: number
          mo_ta: string | null
          quy_cach: string | null
          ten_hang_hoa: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
          trang_thai: string
        }
        Insert: {
          don_vi_tinh: string
          id?: never
          id_danh_muc: number
          mo_ta?: string | null
          quy_cach?: string | null
          ten_hang_hoa: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Update: {
          don_vi_tinh?: string
          id?: never
          id_danh_muc?: number
          mo_ta?: string | null
          quy_cach?: string | null
          ten_hang_hoa?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "kho_danh_sach_hang_hoa_id_danh_muc_fkey"
            columns: ["id_danh_muc"]
            isOneToOne: false
            referencedRelation: "kho_danh_muc_hang_hoa"
            referencedColumns: ["id"]
          },
        ]
      }
      kho_danh_sach_kho: {
        Row: {
          don_vi_id: number | null
          id: number
          mo_ta: string | null
          ten_kho: string
          tg_cap_nhat: string
          tg_tao: string
          tt: number
        }
        Insert: {
          don_vi_id?: number | null
          id?: never
          mo_ta?: string | null
          ten_kho: string
          tg_cap_nhat?: string
          tg_tao?: string
          tt?: number
        }
        Update: {
          don_vi_id?: number | null
          id?: never
          mo_ta?: string | null
          ten_kho?: string
          tg_cap_nhat?: string
          tg_tao?: string
          tt?: number
        }
        Relationships: [
          {
            foreignKeyName: "kho_danh_sach_kho_don_vi_id_fkey"
            columns: ["don_vi_id"]
            isOneToOne: false
            referencedRelation: "v_xa_phuong_min"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kho_danh_sach_kho_don_vi_id_fkey"
            columns: ["don_vi_id"]
            isOneToOne: false
            referencedRelation: "var_ssn_xa_phuong"
            referencedColumns: ["id"]
          },
        ]
      }
      kho_don_vi_cuu_tro: {
        Row: {
          dia_chi: string | null
          dien_thoai: string | null
          email: string | null
          ghi_chu: string | null
          id: number
          loai: string
          ten: string
          tg_cap_nhat: string
          tg_tao: string
          tt: number
        }
        Insert: {
          dia_chi?: string | null
          dien_thoai?: string | null
          email?: string | null
          ghi_chu?: string | null
          id?: never
          loai?: string
          ten: string
          tg_cap_nhat?: string
          tg_tao?: string
          tt?: number
        }
        Update: {
          dia_chi?: string | null
          dien_thoai?: string | null
          email?: string | null
          ghi_chu?: string | null
          id?: never
          loai?: string
          ten?: string
          tg_cap_nhat?: string
          tg_tao?: string
          tt?: number
        }
        Relationships: []
      }
      kho_dot_cuu_tro: {
        Row: {
          id: number
          link: string | null
          mo_ta: string | null
          ten: string
          tg_cap_nhat: string
          tg_tao: string
          tt: number
        }
        Insert: {
          id?: never
          link?: string | null
          mo_ta?: string | null
          ten: string
          tg_cap_nhat?: string
          tg_tao?: string
          tt?: number
        }
        Update: {
          id?: never
          link?: string | null
          mo_ta?: string | null
          ten?: string
          tg_cap_nhat?: string
          tg_tao?: string
          tt?: number
        }
        Relationships: []
      }
      kho_nhap_xuat_kho: {
        Row: {
          don_vi_cuu_tro_id: number | null
          dot_cuu_tro_id: number | null
          ghi_chu: string | null
          id: number
          kho_nhap_id: number | null
          kho_xuat_id: number | null
          loai_phieu: string
          ngay_phieu: string
          so_phieu: string
          tg_cap_nhat: string
          tg_tao: string
          tt: number
        }
        Insert: {
          don_vi_cuu_tro_id?: number | null
          dot_cuu_tro_id?: number | null
          ghi_chu?: string | null
          id?: never
          kho_nhap_id?: number | null
          kho_xuat_id?: number | null
          loai_phieu: string
          ngay_phieu?: string
          so_phieu: string
          tg_cap_nhat?: string
          tg_tao?: string
          tt?: number
        }
        Update: {
          don_vi_cuu_tro_id?: number | null
          dot_cuu_tro_id?: number | null
          ghi_chu?: string | null
          id?: never
          kho_nhap_id?: number | null
          kho_xuat_id?: number | null
          loai_phieu?: string
          ngay_phieu?: string
          so_phieu?: string
          tg_cap_nhat?: string
          tg_tao?: string
          tt?: number
        }
        Relationships: [
          {
            foreignKeyName: "kho_nhap_xuat_kho_don_vi_cuu_tro_id_fkey"
            columns: ["don_vi_cuu_tro_id"]
            isOneToOne: false
            referencedRelation: "kho_don_vi_cuu_tro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kho_nhap_xuat_kho_dot_cuu_tro_id_fkey"
            columns: ["dot_cuu_tro_id"]
            isOneToOne: false
            referencedRelation: "kho_dot_cuu_tro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kho_nhap_xuat_kho_kho_nhap_id_fkey"
            columns: ["kho_nhap_id"]
            isOneToOne: false
            referencedRelation: "kho_danh_sach_kho"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kho_nhap_xuat_kho_kho_xuat_id_fkey"
            columns: ["kho_xuat_id"]
            isOneToOne: false
            referencedRelation: "kho_danh_sach_kho"
            referencedColumns: ["id"]
          },
        ]
      }
      kho_nhap_xuat_kho_ct: {
        Row: {
          don_gia: number
          don_vi_tinh: string
          ghi_chu: string | null
          hang_hoa_id: number
          id: number
          phieu_id: number
          so_luong: number
          tg_cap_nhat: string
          tg_tao: string
          thanh_tien: number | null
          thu_tu: number
        }
        Insert: {
          don_gia?: number
          don_vi_tinh: string
          ghi_chu?: string | null
          hang_hoa_id: number
          id?: never
          phieu_id: number
          so_luong: number
          tg_cap_nhat?: string
          tg_tao?: string
          thanh_tien?: number | null
          thu_tu?: number
        }
        Update: {
          don_gia?: number
          don_vi_tinh?: string
          ghi_chu?: string | null
          hang_hoa_id?: number
          id?: never
          phieu_id?: number
          so_luong?: number
          tg_cap_nhat?: string
          tg_tao?: string
          thanh_tien?: number | null
          thu_tu?: number
        }
        Relationships: [
          {
            foreignKeyName: "kho_nhap_xuat_kho_ct_hang_hoa_fkey"
            columns: ["hang_hoa_id"]
            isOneToOne: false
            referencedRelation: "kho_danh_sach_hang_hoa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kho_nhap_xuat_kho_ct_phieu_fkey"
            columns: ["phieu_id"]
            isOneToOne: false
            referencedRelation: "kho_nhap_xuat_kho"
            referencedColumns: ["id"]
          },
        ]
      }
      luong_thiet_lap_bac_luong: {
        Row: {
          he_so: number
          id: number
          ma_bac: string
          ngach_id: number
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
        }
        Insert: {
          he_so: number
          id?: never
          ma_bac: string
          ngach_id: number
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Update: {
          he_so?: number
          id?: never
          ma_bac?: string
          ngach_id?: number
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Relationships: [
          {
            foreignKeyName: "luong_thiet_lap_bac_luong_ngach_id_fkey"
            columns: ["ngach_id"]
            isOneToOne: false
            referencedRelation: "luong_thiet_lap_ngach_luong"
            referencedColumns: ["id"]
          },
        ]
      }
      luong_thiet_lap_cau_hinh: {
        Row: {
          id: number
          muc_luong_co_so: number
          tg_cap_nhat: string
          tg_tao: string
        }
        Insert: {
          id?: number
          muc_luong_co_so?: number
          tg_cap_nhat?: string
          tg_tao?: string
        }
        Update: {
          id?: number
          muc_luong_co_so?: number
          tg_cap_nhat?: string
          tg_tao?: string
        }
        Relationships: []
      }
      luong_thiet_lap_ngach_luong: {
        Row: {
          id: number
          ma: string | null
          mo_ta: string | null
          ten: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
        }
        Insert: {
          id?: never
          ma?: string | null
          mo_ta?: string | null
          ten: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Update: {
          id?: never
          ma?: string | null
          mo_ta?: string | null
          ten?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Relationships: []
      }
      mttq_can_bo: {
        Row: {
          chuc_vu_id: number | null
          dan_toc_id: number | null
          dang_vien: boolean
          dia_chi: string | null
          dien_thoai: string | null
          don_vi_id: number | null
          gioi_tinh: string
          ho_ten: string
          id: number
          id_nguoi_tao: number
          ly_luan_chinh_tri_id: number | null
          ngay_nhap_trang_thai: string | null
          ngay_sinh: string | null
          ngay_tham_gia_to_chuc: string | null
          ngay_vao_dang: string | null
          noi_o_hien_nay: string | null
          phong_ban_id: number | null
          que_quan: string | null
          tg_cap_nhat: string
          tg_tao: string
          to_chuc_id: number | null
          ton_giao: string | null
          trang_thai_id: number | null
          trinh_do_id: number | null
          van_hoa: string | null
        }
        Insert: {
          chuc_vu_id?: number | null
          dan_toc_id?: number | null
          dang_vien?: boolean
          dia_chi?: string | null
          dien_thoai?: string | null
          don_vi_id?: number | null
          gioi_tinh: string
          ho_ten: string
          id?: never
          id_nguoi_tao: number
          ly_luan_chinh_tri_id?: number | null
          ngay_nhap_trang_thai?: string | null
          ngay_sinh?: string | null
          ngay_tham_gia_to_chuc?: string | null
          ngay_vao_dang?: string | null
          noi_o_hien_nay?: string | null
          phong_ban_id?: number | null
          que_quan?: string | null
          tg_cap_nhat?: string
          tg_tao?: string
          to_chuc_id?: number | null
          ton_giao?: string | null
          trang_thai_id?: number | null
          trinh_do_id?: number | null
          van_hoa?: string | null
        }
        Update: {
          chuc_vu_id?: number | null
          dan_toc_id?: number | null
          dang_vien?: boolean
          dia_chi?: string | null
          dien_thoai?: string | null
          don_vi_id?: number | null
          gioi_tinh?: string
          ho_ten?: string
          id?: never
          id_nguoi_tao?: number
          ly_luan_chinh_tri_id?: number | null
          ngay_nhap_trang_thai?: string | null
          ngay_sinh?: string | null
          ngay_tham_gia_to_chuc?: string | null
          ngay_vao_dang?: string | null
          noi_o_hien_nay?: string | null
          phong_ban_id?: number | null
          que_quan?: string | null
          tg_cap_nhat?: string
          tg_tao?: string
          to_chuc_id?: number | null
          ton_giao?: string | null
          trang_thai_id?: number | null
          trinh_do_id?: number | null
          van_hoa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mttq_can_bo_chuc_vu_id_fkey"
            columns: ["chuc_vu_id"]
            isOneToOne: false
            referencedRelation: "var_chuc_vu"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_can_bo_dan_toc_id_fkey"
            columns: ["dan_toc_id"]
            isOneToOne: false
            referencedRelation: "mttq_thiet_lap"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_can_bo_don_vi_id_fkey"
            columns: ["don_vi_id"]
            isOneToOne: false
            referencedRelation: "v_xa_phuong_min"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_can_bo_don_vi_id_fkey"
            columns: ["don_vi_id"]
            isOneToOne: false
            referencedRelation: "var_ssn_xa_phuong"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_can_bo_id_nguoi_tao_fkey"
            columns: ["id_nguoi_tao"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_can_bo_ly_luan_chinh_tri_id_fkey"
            columns: ["ly_luan_chinh_tri_id"]
            isOneToOne: false
            referencedRelation: "mttq_thiet_lap"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_can_bo_phong_ban_id_fkey"
            columns: ["phong_ban_id"]
            isOneToOne: false
            referencedRelation: "var_phong_ban"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_can_bo_to_chuc_id_fkey"
            columns: ["to_chuc_id"]
            isOneToOne: false
            referencedRelation: "mttq_thiet_lap"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_can_bo_trang_thai_id_fkey"
            columns: ["trang_thai_id"]
            isOneToOne: false
            referencedRelation: "mttq_thiet_lap"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_can_bo_trinh_do_id_fkey"
            columns: ["trinh_do_id"]
            isOneToOne: false
            referencedRelation: "mttq_thiet_lap"
            referencedColumns: ["id"]
          },
        ]
      }
      mttq_diem_danh_uy_vien: {
        Row: {
          ghi_chu: string | null
          id: number
          id_nguoi_tao: number
          ky_hop_id: number
          tg_cap_nhat: string
          tg_tao: string
          trang_thai: string
          uy_vien_id: number
        }
        Insert: {
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao: number
          ky_hop_id: number
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai: string
          uy_vien_id: number
        }
        Update: {
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao?: number
          ky_hop_id?: number
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
          uy_vien_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "mttq_diem_danh_uy_vien_id_nguoi_tao_fkey"
            columns: ["id_nguoi_tao"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_diem_danh_uy_vien_ky_hop_id_fkey"
            columns: ["ky_hop_id"]
            isOneToOne: false
            referencedRelation: "mttq_ky_hop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_diem_danh_uy_vien_ky_hop_id_fkey"
            columns: ["ky_hop_id"]
            isOneToOne: false
            referencedRelation: "v_diem_danh_ky_hop_summary"
            referencedColumns: ["ky_hop_id"]
          },
          {
            foreignKeyName: "mttq_diem_danh_uy_vien_uy_vien_id_fkey"
            columns: ["uy_vien_id"]
            isOneToOne: false
            referencedRelation: "mttq_uy_vien_uy_ban"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_diem_danh_uy_vien_uy_vien_id_fkey"
            columns: ["uy_vien_id"]
            isOneToOne: false
            referencedRelation: "v_diem_danh_uy_vien_summary"
            referencedColumns: ["uy_vien_id"]
          },
        ]
      }
      mttq_khen_thuong: {
        Row: {
          don_vi_de_xuat: string | null
          ghi_chu: string | null
          id: number
          id_nguoi_tao: number
          ngay_khen_thuong: string
          so_qd: string
          tg_cap_nhat: string
          tg_tao: string
          trang_thai: string
        }
        Insert: {
          don_vi_de_xuat?: string | null
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao: number
          ngay_khen_thuong: string
          so_qd: string
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Update: {
          don_vi_de_xuat?: string | null
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao?: number
          ngay_khen_thuong?: string
          so_qd?: string
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "mttq_khen_thuong_id_nguoi_tao_fkey"
            columns: ["id_nguoi_tao"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
        ]
      }
      mttq_khen_thuong_ct: {
        Row: {
          can_bo_id: number
          cap_khen_thuong: string
          danh_hieu: string
          hinh_thuc_khen: string
          ho_so_khen: string | null
          id: number
          id_khen_thuong: number
          noi_dung_khen: string | null
        }
        Insert: {
          can_bo_id: number
          cap_khen_thuong?: string
          danh_hieu: string
          hinh_thuc_khen: string
          ho_so_khen?: string | null
          id?: never
          id_khen_thuong: number
          noi_dung_khen?: string | null
        }
        Update: {
          can_bo_id?: number
          cap_khen_thuong?: string
          danh_hieu?: string
          hinh_thuc_khen?: string
          ho_so_khen?: string | null
          id?: never
          id_khen_thuong?: number
          noi_dung_khen?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mttq_khen_thuong_ct_can_bo_id_fkey"
            columns: ["can_bo_id"]
            isOneToOne: false
            referencedRelation: "mttq_can_bo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_khen_thuong_ct_id_khen_thuong_fkey"
            columns: ["id_khen_thuong"]
            isOneToOne: false
            referencedRelation: "mttq_khen_thuong"
            referencedColumns: ["id"]
          },
        ]
      }
      mttq_ky_hop: {
        Row: {
          don_vi_id: number | null
          ghi_chu: string | null
          id: number
          id_nguoi_tao: number
          ky_thu: string
          ngay_hop: string | null
          nhiem_ky_id: number
          noi_dung_ky_hop: string | null
          tai_lieu_hop: string | null
          tg_cap_nhat: string
          tg_tao: string
        }
        Insert: {
          don_vi_id?: number | null
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao: number
          ky_thu: string
          ngay_hop?: string | null
          nhiem_ky_id: number
          noi_dung_ky_hop?: string | null
          tai_lieu_hop?: string | null
          tg_cap_nhat?: string
          tg_tao?: string
        }
        Update: {
          don_vi_id?: number | null
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao?: number
          ky_thu?: string
          ngay_hop?: string | null
          nhiem_ky_id?: number
          noi_dung_ky_hop?: string | null
          tai_lieu_hop?: string | null
          tg_cap_nhat?: string
          tg_tao?: string
        }
        Relationships: [
          {
            foreignKeyName: "mttq_ky_hop_don_vi_id_fkey"
            columns: ["don_vi_id"]
            isOneToOne: false
            referencedRelation: "v_xa_phuong_min"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_ky_hop_don_vi_id_fkey"
            columns: ["don_vi_id"]
            isOneToOne: false
            referencedRelation: "var_ssn_xa_phuong"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_ky_hop_id_nguoi_tao_fkey"
            columns: ["id_nguoi_tao"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_ky_hop_nhiem_ky_id_fkey"
            columns: ["nhiem_ky_id"]
            isOneToOne: false
            referencedRelation: "mttq_nhiem_ky"
            referencedColumns: ["id"]
          },
        ]
      }
      mttq_lop_tap_huan: {
        Row: {
          cap_tap_huan: string
          don_vi_id: number | null
          ghi_chu: string | null
          id: number
          id_nguoi_tao: number
          nam_tap_huan: number
          ten_lop_tap_huan: string
          tg_cap_nhat: string
          tg_tao: string
        }
        Insert: {
          cap_tap_huan: string
          don_vi_id?: number | null
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao: number
          nam_tap_huan: number
          ten_lop_tap_huan: string
          tg_cap_nhat?: string
          tg_tao?: string
        }
        Update: {
          cap_tap_huan?: string
          don_vi_id?: number | null
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao?: number
          nam_tap_huan?: number
          ten_lop_tap_huan?: string
          tg_cap_nhat?: string
          tg_tao?: string
        }
        Relationships: [
          {
            foreignKeyName: "mttq_lop_tap_huan_don_vi_id_fkey"
            columns: ["don_vi_id"]
            isOneToOne: false
            referencedRelation: "v_xa_phuong_min"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_lop_tap_huan_don_vi_id_fkey"
            columns: ["don_vi_id"]
            isOneToOne: false
            referencedRelation: "var_ssn_xa_phuong"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_lop_tap_huan_id_nguoi_tao_fkey"
            columns: ["id_nguoi_tao"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
        ]
      }
      mttq_lop_tap_huan_ct: {
        Row: {
          can_bo_id: number
          id: number
          id_lop_tap_huan: number
          thuoc_dien: string
        }
        Insert: {
          can_bo_id: number
          id?: never
          id_lop_tap_huan: number
          thuoc_dien: string
        }
        Update: {
          can_bo_id?: number
          id?: never
          id_lop_tap_huan?: number
          thuoc_dien?: string
        }
        Relationships: [
          {
            foreignKeyName: "mttq_lop_tap_huan_ct_can_bo_id_fkey"
            columns: ["can_bo_id"]
            isOneToOne: false
            referencedRelation: "mttq_can_bo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_lop_tap_huan_ct_id_lop_tap_huan_fkey"
            columns: ["id_lop_tap_huan"]
            isOneToOne: false
            referencedRelation: "mttq_lop_tap_huan"
            referencedColumns: ["id"]
          },
        ]
      }
      mttq_nhiem_ky: {
        Row: {
          den_nam: number | null
          ghi_chu: string | null
          id: number
          id_nguoi_tao: number
          sl_can_bo_sung: number
          sl_dang_tham_gia: number
          sl_dau_nhiem_ky: number
          sl_thieu: number
          sl_thoi_tham_gia: number
          ten_nhiem_ky: string
          tg_cap_nhat: string
          tg_tao: string
          thong_tin: string | null
          tu_nam: number | null
        }
        Insert: {
          den_nam?: number | null
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao: number
          sl_can_bo_sung?: number
          sl_dang_tham_gia?: number
          sl_dau_nhiem_ky?: number
          sl_thieu?: number
          sl_thoi_tham_gia?: number
          ten_nhiem_ky: string
          tg_cap_nhat?: string
          tg_tao?: string
          thong_tin?: string | null
          tu_nam?: number | null
        }
        Update: {
          den_nam?: number | null
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao?: number
          sl_can_bo_sung?: number
          sl_dang_tham_gia?: number
          sl_dau_nhiem_ky?: number
          sl_thieu?: number
          sl_thoi_tham_gia?: number
          ten_nhiem_ky?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thong_tin?: string | null
          tu_nam?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mttq_nhiem_ky_id_nguoi_tao_fkey"
            columns: ["id_nguoi_tao"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
        ]
      }
      mttq_tang_luong: {
        Row: {
          bac_luong_id_cu: number | null
          bac_luong_id_moi: number
          can_bo_id: number
          file_quyet_dinh: string | null
          ghi_chu: string | null
          id: number
          id_nguoi_tao: number
          loai_ky: string
          luong: number
          ngach_luong_id_cu: number | null
          ngach_luong_id_moi: number
          ngay_den_han_goc: string | null
          ngay_nang_luong: string
          so_thang_rut_ngan: number | null
          tg_cap_nhat: string
          tg_tao: string
        }
        Insert: {
          bac_luong_id_cu?: number | null
          bac_luong_id_moi: number
          can_bo_id: number
          file_quyet_dinh?: string | null
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao: number
          loai_ky: string
          luong?: number
          ngach_luong_id_cu?: number | null
          ngach_luong_id_moi: number
          ngay_den_han_goc?: string | null
          ngay_nang_luong: string
          so_thang_rut_ngan?: number | null
          tg_cap_nhat?: string
          tg_tao?: string
        }
        Update: {
          bac_luong_id_cu?: number | null
          bac_luong_id_moi?: number
          can_bo_id?: number
          file_quyet_dinh?: string | null
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao?: number
          loai_ky?: string
          luong?: number
          ngach_luong_id_cu?: number | null
          ngach_luong_id_moi?: number
          ngay_den_han_goc?: string | null
          ngay_nang_luong?: string
          so_thang_rut_ngan?: number | null
          tg_cap_nhat?: string
          tg_tao?: string
        }
        Relationships: [
          {
            foreignKeyName: "mttq_tang_luong_bac_cu_fkey"
            columns: ["bac_luong_id_cu"]
            isOneToOne: false
            referencedRelation: "luong_thiet_lap_bac_luong"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_tang_luong_bac_moi_fkey"
            columns: ["bac_luong_id_moi"]
            isOneToOne: false
            referencedRelation: "luong_thiet_lap_bac_luong"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_tang_luong_can_bo_id_fkey"
            columns: ["can_bo_id"]
            isOneToOne: false
            referencedRelation: "mttq_can_bo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_tang_luong_id_nguoi_tao_fkey"
            columns: ["id_nguoi_tao"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_tang_luong_ngach_cu_fkey"
            columns: ["ngach_luong_id_cu"]
            isOneToOne: false
            referencedRelation: "luong_thiet_lap_ngach_luong"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_tang_luong_ngach_moi_fkey"
            columns: ["ngach_luong_id_moi"]
            isOneToOne: false
            referencedRelation: "luong_thiet_lap_ngach_luong"
            referencedColumns: ["id"]
          },
        ]
      }
      mttq_thiet_lap: {
        Row: {
          id: number
          loai: string
          mo_ta: string | null
          ten: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
        }
        Insert: {
          id?: never
          loai: string
          mo_ta?: string | null
          ten: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Update: {
          id?: never
          loai?: string
          mo_ta?: string | null
          ten?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Relationships: []
      }
      mttq_uy_vien_uy_ban: {
        Row: {
          can_bo_id: number
          don_vi_id: number | null
          ghi_chu: string | null
          id: number
          id_nguoi_tao: number
          ma_uv: string | null
          nhiem_ky_id: number
          tg_cap_nhat: string
          tg_tao: string
          trang_thai_tham_gia: string | null
        }
        Insert: {
          can_bo_id: number
          don_vi_id?: number | null
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao: number
          ma_uv?: string | null
          nhiem_ky_id: number
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai_tham_gia?: string | null
        }
        Update: {
          can_bo_id?: number
          don_vi_id?: number | null
          ghi_chu?: string | null
          id?: never
          id_nguoi_tao?: number
          ma_uv?: string | null
          nhiem_ky_id?: number
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai_tham_gia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mttq_uy_vien_uy_ban_can_bo_id_fkey"
            columns: ["can_bo_id"]
            isOneToOne: false
            referencedRelation: "mttq_can_bo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_uy_vien_uy_ban_don_vi_id_fkey"
            columns: ["don_vi_id"]
            isOneToOne: false
            referencedRelation: "v_xa_phuong_min"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_uy_vien_uy_ban_don_vi_id_fkey"
            columns: ["don_vi_id"]
            isOneToOne: false
            referencedRelation: "var_ssn_xa_phuong"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_uy_vien_uy_ban_id_nguoi_tao_fkey"
            columns: ["id_nguoi_tao"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mttq_uy_vien_uy_ban_nhiem_ky_id_fkey"
            columns: ["nhiem_ky_id"]
            isOneToOne: false
            referencedRelation: "mttq_nhiem_ky"
            referencedColumns: ["id"]
          },
        ]
      }
      var_chuc_vu: {
        Row: {
          cap_bac: number | null
          cap_quan_ly: string | null
          id: number
          mo_ta: string | null
          phong_ban_id: number | null
          ten_chuc_vu: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
          trang_thai: string
        }
        Insert: {
          cap_bac?: number | null
          cap_quan_ly?: string | null
          id?: never
          mo_ta?: string | null
          phong_ban_id?: number | null
          ten_chuc_vu: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Update: {
          cap_bac?: number | null
          cap_quan_ly?: string | null
          id?: never
          mo_ta?: string | null
          phong_ban_id?: number | null
          ten_chuc_vu?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "var_chuc_vu_phong_ban_id_fkey"
            columns: ["phong_ban_id"]
            isOneToOne: false
            referencedRelation: "var_phong_ban"
            referencedColumns: ["id"]
          },
        ]
      }
      var_nhan_vien: {
        Row: {
          don_vi_id: number | null
          hinh_anh: string | null
          ho_va_ten: string
          id: number
          id_bo_phan: number | null
          id_chuc_vu: number | null
          id_phong_ban: number | null
          ten_tai_khoan: string
          tg_cap_nhat: string
          tg_tao: string
          trang_thai: string
        }
        Insert: {
          don_vi_id?: number | null
          hinh_anh?: string | null
          ho_va_ten: string
          id?: never
          id_bo_phan?: number | null
          id_chuc_vu?: number | null
          id_phong_ban?: number | null
          ten_tai_khoan: string
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Update: {
          don_vi_id?: number | null
          hinh_anh?: string | null
          ho_va_ten?: string
          id?: never
          id_bo_phan?: number | null
          id_chuc_vu?: number | null
          id_phong_ban?: number | null
          ten_tai_khoan?: string
          tg_cap_nhat?: string
          tg_tao?: string
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "var_nhan_vien_don_vi_id_fkey"
            columns: ["don_vi_id"]
            isOneToOne: false
            referencedRelation: "v_xa_phuong_min"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "var_nhan_vien_don_vi_id_fkey"
            columns: ["don_vi_id"]
            isOneToOne: false
            referencedRelation: "var_ssn_xa_phuong"
            referencedColumns: ["id"]
          },
        ]
      }
      var_phan_quyen: {
        Row: {
          chuc_vu_id: number
          id: number
          module_key: string
          quyen: string
          tg_cap_nhat: string
        }
        Insert: {
          chuc_vu_id: number
          id?: never
          module_key: string
          quyen?: string
          tg_cap_nhat?: string
        }
        Update: {
          chuc_vu_id?: number
          id?: never
          module_key?: string
          quyen?: string
          tg_cap_nhat?: string
        }
        Relationships: [
          {
            foreignKeyName: "var_phan_quyen_chuc_vu_id_fkey"
            columns: ["chuc_vu_id"]
            isOneToOne: false
            referencedRelation: "var_chuc_vu"
            referencedColumns: ["id"]
          },
        ]
      }
      var_phong_ban: {
        Row: {
          cap_do: number
          cha_id: number | null
          duong_dan: string
          id: number
          mo_ta: string | null
          ten_phong_ban: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
          trang_thai: string
        }
        Insert: {
          cap_do?: number
          cha_id?: number | null
          duong_dan?: string
          id?: never
          mo_ta?: string | null
          ten_phong_ban: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Update: {
          cap_do?: number
          cha_id?: number | null
          duong_dan?: string
          id?: never
          mo_ta?: string | null
          ten_phong_ban?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
          trang_thai?: string
        }
        Relationships: [
          {
            foreignKeyName: "var_phong_ban_cha_id_fkey"
            columns: ["cha_id"]
            isOneToOne: false
            referencedRelation: "var_phong_ban"
            referencedColumns: ["id"]
          },
        ]
      }
      var_ssn_tinh_thanh: {
        Row: {
          id: number
          ten: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
        }
        Insert: {
          id?: never
          ten: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Update: {
          id?: never
          ten?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Relationships: []
      }
      var_ssn_xa_phuong: {
        Row: {
          id: number
          id_tinh_thanh: number
          ten: string
          tg_cap_nhat: string
          tg_tao: string
          thu_tu: number
        }
        Insert: {
          id?: never
          id_tinh_thanh: number
          ten: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Update: {
          id?: never
          id_tinh_thanh?: number
          ten?: string
          tg_cap_nhat?: string
          tg_tao?: string
          thu_tu?: number
        }
        Relationships: [
          {
            foreignKeyName: "var_ssn_xa_phuong_id_tinh_thanh_fkey"
            columns: ["id_tinh_thanh"]
            isOneToOne: false
            referencedRelation: "var_ssn_tinh_thanh"
            referencedColumns: ["id"]
          },
        ]
      }
      var_thong_tin_to_chuc: {
        Row: {
          dia_chi: string | null
          dien_thoai: string | null
          email: string | null
          id: number
          mo_ta_ngan: string | null
          ten_to_chuc: string
          ten_ung_dung: string
          tg_cap_nhat: string
          tg_tao: string
          url_logo: string | null
          website: string | null
        }
        Insert: {
          dia_chi?: string | null
          dien_thoai?: string | null
          email?: string | null
          id?: number
          mo_ta_ngan?: string | null
          ten_to_chuc: string
          ten_ung_dung?: string
          tg_cap_nhat?: string
          tg_tao?: string
          url_logo?: string | null
          website?: string | null
        }
        Update: {
          dia_chi?: string | null
          dien_thoai?: string | null
          email?: string | null
          id?: number
          mo_ta_ngan?: string | null
          ten_to_chuc?: string
          ten_ung_dung?: string
          tg_cap_nhat?: string
          tg_tao?: string
          url_logo?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      kho_ton_kho_view: {
        Row: {
          hang_hoa_id: number | null
          kho_id: number | null
          ton_kho: number | null
        }
        Relationships: []
      }
      v_cong_viec_bao_cao: {
        Row: {
          days_to_deadline: number | null
          ghi_chu: string | null
          ho_va_ten_nguoi_tao: string | null
          ho_va_ten_trach_nhiem: string | null
          id: number | null
          id_nguoi_tao: number | null
          id_trach_nhiem: number | null
          ids_ho_tro: number[] | null
          ket_qua: string | null
          link_kq: string | null
          link_tai_lieu: string | null
          muc_do: string | null
          ngay_hoan_thanh: string | null
          ten_cong_viec: string | null
          ten_tai_khoan_nguoi_tao: string | null
          ten_tai_khoan_trach_nhiem: string | null
          tg_cap_nhat: string | null
          tg_tao: string | null
          thoi_han: string | null
          tien_do: number | null
          trang_thai: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cong_viec_danh_sach_id_nguoi_tao_fkey"
            columns: ["id_nguoi_tao"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cong_viec_danh_sach_id_trach_nhiem_fkey"
            columns: ["id_trach_nhiem"]
            isOneToOne: false
            referencedRelation: "var_nhan_vien"
            referencedColumns: ["id"]
          },
        ]
      }
      v_diem_danh_ky_hop_summary: {
        Row: {
          chua_diem_danh: number | null
          co_mat: number | null
          ky_hop_id: number | null
          ky_thu: string | null
          ngay_hop: string | null
          nhiem_ky_id: number | null
          sl_uy_vien_nhiem_ky: number | null
          tong_diem_danh: number | null
          vang_mat: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mttq_ky_hop_nhiem_ky_id_fkey"
            columns: ["nhiem_ky_id"]
            isOneToOne: false
            referencedRelation: "mttq_nhiem_ky"
            referencedColumns: ["id"]
          },
        ]
      }
      v_diem_danh_uy_vien_summary: {
        Row: {
          chua_diem_danh: number | null
          co_mat: number | null
          nhiem_ky_id: number | null
          so_ky_hop: number | null
          uy_vien_id: number | null
          vang_mat: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mttq_uy_vien_uy_ban_nhiem_ky_id_fkey"
            columns: ["nhiem_ky_id"]
            isOneToOne: false
            referencedRelation: "mttq_nhiem_ky"
            referencedColumns: ["id"]
          },
        ]
      }
      v_xa_phuong_min: {
        Row: {
          id: number | null
          id_tinh_thanh: number | null
          ten: string | null
        }
        Insert: {
          id?: number | null
          id_tinh_thanh?: number | null
          ten?: string | null
        }
        Update: {
          id?: number | null
          id_tinh_thanh?: number | null
          ten?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "var_ssn_xa_phuong_id_tinh_thanh_fkey"
            columns: ["id_tinh_thanh"]
            isOneToOne: false
            referencedRelation: "var_ssn_tinh_thanh"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cong_viec_bao_cao_filter_options: {
        Args: {
          p_end: string
          p_start: string
          p_view_all?: boolean
          p_viewer_don_vi_id?: number
          p_viewer_id?: number
        }
        Returns: {
          nguoi_tao: Json
          trach_nhiem: Json
        }[]
      }
      cong_viec_bao_cao_kpi: {
        Args: {
          p_end: string
          p_id_nguoi_tao?: number[]
          p_id_trach_nhiem?: number[]
          p_muc_do?: string[]
          p_overdue_only?: boolean
          p_start: string
          p_trang_thai?: string[]
          p_view_all?: boolean
          p_viewer_don_vi_id?: number
          p_viewer_id?: number
        }
        Returns: {
          dang: number
          distinct_nguoi_tao: number
          distinct_trach_nhiem: number
          hoan_thanh: number
          hoan_thanh_dung_han: number
          huy: number
          moi: number
          qua_han: number
          sap_het_han: number
          tam_dung: number
          total: number
        }[]
      }
      cong_viec_bao_cao_lookup: {
        Args: {
          p_end: string
          p_id_nguoi_tao?: number[]
          p_id_trach_nhiem?: number[]
          p_limit?: number
          p_muc_do?: string[]
          p_offset?: number
          p_overdue_only?: boolean
          p_sort?: string
          p_start: string
          p_trang_thai?: string[]
          p_view_all?: boolean
          p_viewer_don_vi_id?: number
          p_viewer_id?: number
        }
        Returns: {
          days_to_deadline: number
          ghi_chu: string
          ho_va_ten_nguoi_tao: string
          ho_va_ten_trach_nhiem: string
          id: string
          id_nguoi_tao: string
          id_trach_nhiem: string
          ids_ho_tro: number[]
          ket_qua: string
          link_kq: string
          link_tai_lieu: string
          muc_do: string
          ngay_hoan_thanh: string
          ten_cong_viec: string
          ten_tai_khoan_nguoi_tao: string
          ten_tai_khoan_trach_nhiem: string
          tg_cap_nhat: string
          tg_tao: string
          thoi_han: string
          tien_do: number
          total_count: number
          trang_thai: string
        }[]
      }
      cong_viec_bao_cao_phan_bo_muc_do: {
        Args: {
          p_end: string
          p_id_nguoi_tao?: number[]
          p_id_trach_nhiem?: number[]
          p_muc_do?: string[]
          p_overdue_only?: boolean
          p_start: string
          p_trang_thai?: string[]
          p_view_all?: boolean
          p_viewer_don_vi_id?: number
          p_viewer_id?: number
        }
        Returns: {
          count: number
          muc_do: string
        }[]
      }
      cong_viec_bao_cao_phan_bo_trang_thai: {
        Args: {
          p_end: string
          p_id_nguoi_tao?: number[]
          p_id_trach_nhiem?: number[]
          p_muc_do?: string[]
          p_overdue_only?: boolean
          p_start: string
          p_trang_thai?: string[]
          p_view_all?: boolean
          p_viewer_don_vi_id?: number
          p_viewer_id?: number
        }
        Returns: {
          count: number
          trang_thai: string
        }[]
      }
      cong_viec_bao_cao_top_nguoi_tao: {
        Args: {
          p_end: string
          p_id_nguoi_tao?: number[]
          p_id_trach_nhiem?: number[]
          p_muc_do?: string[]
          p_overdue_only?: boolean
          p_start: string
          p_top?: number
          p_trang_thai?: string[]
          p_view_all?: boolean
          p_viewer_don_vi_id?: number
          p_viewer_id?: number
        }
        Returns: {
          completion_rate: number
          ho_va_ten: string
          hoan_thanh: number
          id_nguoi_tao: number
          qua_han: number
          ten_tai_khoan: string
          total: number
        }[]
      }
      cong_viec_bao_cao_top_trach_nhiem: {
        Args: {
          p_end: string
          p_id_nguoi_tao?: number[]
          p_id_trach_nhiem?: number[]
          p_muc_do?: string[]
          p_overdue_only?: boolean
          p_start: string
          p_top?: number
          p_trang_thai?: string[]
          p_view_all?: boolean
          p_viewer_don_vi_id?: number
          p_viewer_id?: number
        }
        Returns: {
          completion_rate: number
          dang: number
          ho_va_ten: string
          hoan_thanh: number
          id_trach_nhiem: number
          qua_han: number
          ten_tai_khoan: string
          total: number
        }[]
      }
      cong_viec_bao_cao_trend: {
        Args: {
          p_bucket?: string
          p_end: string
          p_id_nguoi_tao?: number[]
          p_id_trach_nhiem?: number[]
          p_muc_do?: string[]
          p_overdue_only?: boolean
          p_start: string
          p_trang_thai?: string[]
          p_view_all?: boolean
          p_viewer_don_vi_id?: number
          p_viewer_id?: number
        }
        Returns: {
          bucket_key: string
          created: number
          done: number
          label: string
          overdue: number
        }[]
      }
      get_bai_viet_page: {
        Args: {
          p_limit?: number
          p_nguon_dang_ids?: number[]
          p_offset?: number
          p_scope?: string
          p_search?: string
          p_the_loai_ids?: number[]
          p_trang_dang_ids?: number[]
          p_viewer_don_vi_id?: number
          p_viewer_nhan_vien_id?: number
        }
        Returns: {
          don_gia: number
          id: number
          id_nguoi_tao: number
          id_nguon_dang: number
          id_the_loai: number
          id_trang_dang: number
          link: string
          ngay_dang: string
          ten_bai: string
          tg_cap_nhat: string
          tg_tao: string
        }[]
        SetofOptions: {
          from: "*"
          to: "bai_viet_danh_sach"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_cong_viec_page: {
        Args: {
          p_chuong_trinh_include_null?: boolean
          p_id_chuong_trinh?: number[]
          p_limit?: number
          p_list_scope?: string
          p_muc_do?: string[]
          p_offset?: number
          p_search?: string
          p_trang_thai?: string[]
          p_viewer_nhan_vien_id?: number
        }
        Returns: {
          ghi_chu: string | null
          id: number
          id_chuong_trinh: number | null
          id_nguoi_tao: number
          id_trach_nhiem: number
          ids_ho_tro: number[]
          ket_qua: string | null
          link_kq: string | null
          link_tai_lieu: string | null
          muc_do: string
          ngay_hoan_thanh: string | null
          ten_cong_viec: string
          tg_cap_nhat: string
          tg_tao: string
          thoi_han: string | null
          tien_do: number
          trang_thai: string
        }[]
        SetofOptions: {
          from: "*"
          to: "cong_viec_danh_sach"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_diem_danh_for_nhiem_ky: {
        Args: { p_nhiem_ky_id: string }
        Returns: {
          ky_hop_id: string
          trang_thai: string
          uy_vien_id: string
        }[]
      }
      get_nhan_vien_count_by_chuc_vu: {
        Args: never
        Returns: {
          id_chuc_vu: number
          so_nhan_vien: number
        }[]
      }
      get_phong_ban_path_level: {
        Args: { p_cha_id: number; p_id: number }
        Returns: {
          cap_do: number
          duong_dan: string
        }[]
      }
      get_xa_counts_by_tinh_thanh: {
        Args: never
        Returns: {
          id_tinh_thanh: string
          so_xa: number
        }[]
      }
      rpc_kho_cap_nhat_phieu_nhap_xuat: {
        Args: {
          p_chi_tiet: Json
          p_don_vi_cuu_tro_id: number
          p_dot_cuu_tro_id: number
          p_ghi_chu: string
          p_id: number
          p_kho_nhap_id: number
          p_kho_xuat_id: number
          p_loai_phieu: string
          p_ngay_phieu: string
        }
        Returns: number
      }
      rpc_kho_tao_phieu_nhap_xuat: {
        Args: {
          p_chi_tiet: Json
          p_don_vi_cuu_tro_id: number
          p_dot_cuu_tro_id: number
          p_ghi_chu: string
          p_kho_nhap_id: number
          p_kho_xuat_id: number
          p_loai_phieu: string
          p_ngay_phieu: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
