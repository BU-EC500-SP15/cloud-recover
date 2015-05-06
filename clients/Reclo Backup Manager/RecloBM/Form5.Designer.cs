namespace RecloBM
{
    partial class Form5
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
            this.button4 = new System.Windows.Forms.Button();
            this.button3 = new System.Windows.Forms.Button();
            this.button2 = new System.Windows.Forms.Button();
            this.button1 = new System.Windows.Forms.Button();
            this.label2 = new System.Windows.Forms.Label();
            this.logout = new System.Windows.Forms.Button();
            this.username = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.label4 = new System.Windows.Forms.Label();
            this.sourceTB = new System.Windows.Forms.TextBox();
            this.destTB = new System.Windows.Forms.TextBox();
            this.openFileDialog1 = new System.Windows.Forms.OpenFileDialog();
            this.openFileDialog2 = new System.Windows.Forms.OpenFileDialog();
            this.dateTimePicker1 = new System.Windows.Forms.DateTimePicker();
            this.label5 = new System.Windows.Forms.Label();
            this.selectBackupSource = new System.Windows.Forms.Button();
            this.selectDestination = new System.Windows.Forms.Button();
            this.checkBox1 = new System.Windows.Forms.CheckBox();
            this.SuspendLayout();
            // 
            // button4
            // 
            this.button4.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(52)))), ((int)(((byte)(73)))), ((int)(((byte)(94)))));
            this.button4.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.button4.Font = new System.Drawing.Font("Microsoft Sans Serif", 16.2F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.button4.ForeColor = System.Drawing.Color.White;
            this.button4.Location = new System.Drawing.Point(11, 328);
            this.button4.Name = "button4";
            this.button4.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.button4.Size = new System.Drawing.Size(408, 63);
            this.button4.TabIndex = 16;
            this.button4.Text = "Save Settings";
            this.button4.UseVisualStyleBackColor = false;
            this.button4.Click += new System.EventHandler(this.button4_Click);
            // 
            // button3
            // 
            this.button3.FlatAppearance.BorderSize = 0;
            this.button3.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.button3.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.8F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.button3.Location = new System.Drawing.Point(244, 7);
            this.button3.Name = "button3";
            this.button3.Size = new System.Drawing.Size(94, 28);
            this.button3.TabIndex = 15;
            this.button3.Text = "Settings";
            this.button3.UseVisualStyleBackColor = true;
            // 
            // button2
            // 
            this.button2.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.button2.ImageAlign = System.Drawing.ContentAlignment.TopRight;
            this.button2.Location = new System.Drawing.Point(133, 7);
            this.button2.Name = "button2";
            this.button2.Size = new System.Drawing.Size(105, 28);
            this.button2.TabIndex = 14;
            this.button2.Text = "My Backups";
            this.button2.UseVisualStyleBackColor = true;
            this.button2.Click += new System.EventHandler(this.button2_Click);
            // 
            // button1
            // 
            this.button1.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.button1.Location = new System.Drawing.Point(52, 7);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(75, 28);
            this.button1.TabIndex = 13;
            this.button1.Text = "Home";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // label2
            // 
            this.label2.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(103)))), ((int)(((byte)(128)))), ((int)(((byte)(159)))));
            this.label2.Location = new System.Drawing.Point(-1, 0);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(433, 35);
            this.label2.TabIndex = 17;
            // 
            // logout
            // 
            this.logout.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(52)))), ((int)(((byte)(73)))), ((int)(((byte)(94)))));
            this.logout.FlatAppearance.BorderSize = 0;
            this.logout.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.logout.ForeColor = System.Drawing.Color.White;
            this.logout.Location = new System.Drawing.Point(311, 69);
            this.logout.Name = "logout";
            this.logout.Size = new System.Drawing.Size(108, 35);
            this.logout.TabIndex = 18;
            this.logout.Text = "Logout";
            this.logout.UseVisualStyleBackColor = false;
            this.logout.Click += new System.EventHandler(this.logout_Click);
            // 
            // username
            // 
            this.username.AutoSize = true;
            this.username.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.8F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.username.Location = new System.Drawing.Point(8, 75);
            this.username.Name = "username";
            this.username.Size = new System.Drawing.Size(91, 17);
            this.username.TabIndex = 19;
            this.username.Text = "Username: ";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.8F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label3.Location = new System.Drawing.Point(11, 128);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(127, 17);
            this.label3.TabIndex = 20;
            this.label3.Text = "Backup Source: ";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.8F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label4.Location = new System.Drawing.Point(11, 172);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(153, 17);
            this.label4.TabIndex = 21;
            this.label4.Text = "Backup Destination:";
            // 
            // sourceTB
            // 
            this.sourceTB.BackColor = System.Drawing.Color.White;
            this.sourceTB.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.sourceTB.Location = new System.Drawing.Point(208, 128);
            this.sourceTB.Name = "sourceTB";
            this.sourceTB.ReadOnly = true;
            this.sourceTB.Size = new System.Drawing.Size(211, 22);
            this.sourceTB.TabIndex = 22;
            this.sourceTB.Text = "Select Drive...";
            // 
            // destTB
            // 
            this.destTB.BackColor = System.Drawing.Color.White;
            this.destTB.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.destTB.Location = new System.Drawing.Point(208, 169);
            this.destTB.Name = "destTB";
            this.destTB.ReadOnly = true;
            this.destTB.Size = new System.Drawing.Size(211, 22);
            this.destTB.TabIndex = 23;
            this.destTB.Text = "Select Location...";
            // 
            // openFileDialog1
            // 
            this.openFileDialog1.FileName = "openFileDialog1";
            // 
            // openFileDialog2
            // 
            this.openFileDialog2.FileName = "openFileDialog2";
            // 
            // dateTimePicker1
            // 
            this.dateTimePicker1.Format = System.Windows.Forms.DateTimePickerFormat.Time;
            this.dateTimePicker1.Location = new System.Drawing.Point(208, 251);
            this.dateTimePicker1.MaxDate = new System.DateTime(2015, 4, 16, 0, 0, 0, 0);
            this.dateTimePicker1.MinDate = new System.DateTime(2015, 4, 16, 0, 0, 0, 0);
            this.dateTimePicker1.Name = "dateTimePicker1";
            this.dateTimePicker1.Size = new System.Drawing.Size(211, 22);
            this.dateTimePicker1.TabIndex = 24;
            this.dateTimePicker1.Value = new System.DateTime(2015, 4, 16, 0, 0, 0, 0);
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.8F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label5.Location = new System.Drawing.Point(8, 256);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(178, 17);
            this.label5.TabIndex = 25;
            this.label5.Text = "Schedule Backup Time:";
            // 
            // selectBackupSource
            // 
            this.selectBackupSource.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(52)))), ((int)(((byte)(73)))), ((int)(((byte)(94)))));
            this.selectBackupSource.FlatAppearance.BorderSize = 0;
            this.selectBackupSource.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.selectBackupSource.ForeColor = System.Drawing.Color.White;
            this.selectBackupSource.Location = new System.Drawing.Point(344, 128);
            this.selectBackupSource.Name = "selectBackupSource";
            this.selectBackupSource.Size = new System.Drawing.Size(75, 23);
            this.selectBackupSource.TabIndex = 27;
            this.selectBackupSource.Text = "Browse";
            this.selectBackupSource.UseVisualStyleBackColor = false;
            this.selectBackupSource.Click += new System.EventHandler(this.selectBackupSource_Click);
            // 
            // selectDestination
            // 
            this.selectDestination.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(52)))), ((int)(((byte)(73)))), ((int)(((byte)(94)))));
            this.selectDestination.FlatAppearance.BorderSize = 0;
            this.selectDestination.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.selectDestination.ForeColor = System.Drawing.Color.White;
            this.selectDestination.Location = new System.Drawing.Point(344, 169);
            this.selectDestination.Name = "selectDestination";
            this.selectDestination.Size = new System.Drawing.Size(75, 23);
            this.selectDestination.TabIndex = 29;
            this.selectDestination.Text = "Browse";
            this.selectDestination.UseVisualStyleBackColor = false;
            this.selectDestination.Click += new System.EventHandler(this.selectDestination_Click);
            // 
            // checkBox1
            // 
            this.checkBox1.AutoSize = true;
            this.checkBox1.Enabled = false;
            this.checkBox1.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.checkBox1.Location = new System.Drawing.Point(208, 210);
            this.checkBox1.Name = "checkBox1";
            this.checkBox1.Size = new System.Drawing.Size(174, 21);
            this.checkBox1.TabIndex = 30;
            this.checkBox1.Text = "Scheduled Backups On";
            this.checkBox1.UseVisualStyleBackColor = true;
            this.checkBox1.CheckedChanged += new System.EventHandler(this.checkBox1_CheckedChanged);
            // 
            // Form5
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(432, 403);
            this.Controls.Add(this.checkBox1);
            this.Controls.Add(this.selectDestination);
            this.Controls.Add(this.selectBackupSource);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.dateTimePicker1);
            this.Controls.Add(this.destTB);
            this.Controls.Add(this.sourceTB);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.username);
            this.Controls.Add(this.logout);
            this.Controls.Add(this.button4);
            this.Controls.Add(this.button3);
            this.Controls.Add(this.button2);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.label2);
            this.MaximumSize = new System.Drawing.Size(450, 450);
            this.MinimumSize = new System.Drawing.Size(450, 450);
            this.Name = "Form5";
            this.Text = "ReClo Backup Manager";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button button4;
        private System.Windows.Forms.Button button3;
        private System.Windows.Forms.Button button2;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label username;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.TextBox sourceTB;
        private System.Windows.Forms.TextBox destTB;
        private System.Windows.Forms.OpenFileDialog openFileDialog1;
        private System.Windows.Forms.OpenFileDialog openFileDialog2;
        private System.Windows.Forms.DateTimePicker dateTimePicker1;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.Button logout;
        private System.Windows.Forms.Button selectBackupSource;
        private System.Windows.Forms.Button selectDestination;
        private System.Windows.Forms.CheckBox checkBox1;
    }
}