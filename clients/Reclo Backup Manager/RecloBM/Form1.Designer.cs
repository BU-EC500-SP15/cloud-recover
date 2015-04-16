namespace RecloBM
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Form1));
            this.emailTB = new System.Windows.Forms.TextBox();
            this.passTB = new System.Windows.Forms.TextBox();
            this.loginBTN = new System.Windows.Forms.Button();
            this.regBTN = new System.Windows.Forms.Button();
            this.EmailLB = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.logErrorLB = new System.Windows.Forms.Label();
            this.pictureBox1 = new System.Windows.Forms.PictureBox();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).BeginInit();
            this.SuspendLayout();
            // 
            // emailTB
            // 
            this.emailTB.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.emailTB.Location = new System.Drawing.Point(12, 235);
            this.emailTB.Name = "emailTB";
            this.emailTB.Size = new System.Drawing.Size(312, 22);
            this.emailTB.TabIndex = 0;
            // 
            // passTB
            // 
            this.passTB.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.passTB.Location = new System.Drawing.Point(12, 280);
            this.passTB.Name = "passTB";
            this.passTB.PasswordChar = '*';
            this.passTB.Size = new System.Drawing.Size(312, 22);
            this.passTB.TabIndex = 1;
            this.passTB.UseSystemPasswordChar = true;
            // 
            // loginBTN
            // 
            this.loginBTN.BackColor = System.Drawing.Color.DimGray;
            this.loginBTN.FlatAppearance.BorderSize = 0;
            this.loginBTN.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.loginBTN.Font = new System.Drawing.Font("Microsoft Sans Serif", 13.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.loginBTN.ForeColor = System.Drawing.Color.White;
            this.loginBTN.Location = new System.Drawing.Point(12, 353);
            this.loginBTN.Name = "loginBTN";
            this.loginBTN.Size = new System.Drawing.Size(312, 53);
            this.loginBTN.TabIndex = 2;
            this.loginBTN.Text = "Login";
            this.loginBTN.UseVisualStyleBackColor = false;
            this.loginBTN.Click += new System.EventHandler(this.loginBTN_Click);
            // 
            // regBTN
            // 
            this.regBTN.BackColor = System.Drawing.Color.DimGray;
            this.regBTN.FlatAppearance.BorderSize = 0;
            this.regBTN.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.regBTN.Font = new System.Drawing.Font("Microsoft Sans Serif", 13.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.regBTN.ForeColor = System.Drawing.Color.White;
            this.regBTN.Location = new System.Drawing.Point(12, 412);
            this.regBTN.Name = "regBTN";
            this.regBTN.Size = new System.Drawing.Size(312, 53);
            this.regBTN.TabIndex = 3;
            this.regBTN.Text = "Register";
            this.regBTN.UseVisualStyleBackColor = false;
            this.regBTN.Click += new System.EventHandler(this.regBTN_Click);
            // 
            // EmailLB
            // 
            this.EmailLB.AutoSize = true;
            this.EmailLB.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.8F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.EmailLB.Location = new System.Drawing.Point(9, 215);
            this.EmailLB.Name = "EmailLB";
            this.EmailLB.Size = new System.Drawing.Size(47, 17);
            this.EmailLB.TabIndex = 5;
            this.EmailLB.Text = "Email";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.8F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label2.Location = new System.Drawing.Point(9, 260);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(77, 17);
            this.label2.TabIndex = 6;
            this.label2.Text = "Password";
            // 
            // logErrorLB
            // 
            this.logErrorLB.AutoSize = true;
            this.logErrorLB.Font = new System.Drawing.Font("Microsoft Sans Serif", 9F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.logErrorLB.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(192)))), ((int)(((byte)(0)))), ((int)(((byte)(0)))));
            this.logErrorLB.ImageAlign = System.Drawing.ContentAlignment.TopCenter;
            this.logErrorLB.Location = new System.Drawing.Point(12, 305);
            this.logErrorLB.Name = "logErrorLB";
            this.logErrorLB.Size = new System.Drawing.Size(81, 18);
            this.logErrorLB.TabIndex = 14;
            this.logErrorLB.Text = "Error Label";
            // 
            // pictureBox1
            // 
            this.pictureBox1.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(77)))), ((int)(((byte)(126)))), ((int)(((byte)(249)))));
            this.pictureBox1.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Stretch;
            this.pictureBox1.Image = ((System.Drawing.Image)(resources.GetObject("pictureBox1.Image")));
            this.pictureBox1.Location = new System.Drawing.Point(-4, -2);
            this.pictureBox1.Name = "pictureBox1";
            this.pictureBox1.Size = new System.Drawing.Size(341, 190);
            this.pictureBox1.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom;
            this.pictureBox1.TabIndex = 4;
            this.pictureBox1.TabStop = false;
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.SystemColors.Control;
            this.ClientSize = new System.Drawing.Size(336, 477);
            this.Controls.Add(this.logErrorLB);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.EmailLB);
            this.Controls.Add(this.pictureBox1);
            this.Controls.Add(this.regBTN);
            this.Controls.Add(this.loginBTN);
            this.Controls.Add(this.passTB);
            this.Controls.Add(this.emailTB);
            this.MaximumSize = new System.Drawing.Size(354, 524);
            this.MinimumSize = new System.Drawing.Size(354, 524);
            this.Name = "Form1";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "ReClo Backup";
            this.Load += new System.EventHandler(this.Form1_Load);
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox emailTB;
        private System.Windows.Forms.TextBox passTB;
        private System.Windows.Forms.Button loginBTN;
        private System.Windows.Forms.Button regBTN;
        private System.Windows.Forms.PictureBox pictureBox1;
        private System.Windows.Forms.Label EmailLB;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label logErrorLB;
    }
}

